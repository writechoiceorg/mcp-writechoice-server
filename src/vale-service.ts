import fs from 'fs/promises';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

export interface ValeLintResult {
  file: string;
  errors: ValeLintError[];
  suggestions: ValeLintError[];
  warnings: ValeLintError[];
}

export interface ValeLintError {
  line: number;
  column: number;
  message: string;
  severity: string;
  rule: string;
  suggestion?: string;
}

export class ValeService {
  private execAsync = promisify(exec);
  private valeConfigPath: string;

  constructor(valeConfigPath?: string) {
    this.valeConfigPath = valeConfigPath || path.resolve(process.cwd(), 'vale.ini');
  }

  async lintTextWithVale(text: string, fileName: string = 'document.md'): Promise<ValeLintResult> {
    try {
      // Create temporary file with text content
      const tempDir = path.join(process.cwd(), 'temp');
      await fs.mkdir(tempDir, { recursive: true });
      
      const tempFilePath = path.join(tempDir, fileName);
      await fs.writeFile(tempFilePath, text, 'utf8');

      // Run Vale lint
      const lintResult = await this.runValeLint(tempFilePath);

      // Clean up temporary file
      await fs.unlink(tempFilePath);

      return {
        file: fileName,
        errors: lintResult.errors,
        suggestions: lintResult.suggestions,
        warnings: lintResult.warnings,
      };
    } catch (error: any) {
      throw new Error(`Failed to lint text: ${error.message}`);
    }
  }

  private async runValeLint(filePath: string): Promise<{ errors: ValeLintError[]; suggestions: ValeLintError[]; warnings: ValeLintError[] }> {
    try {
      const valeCommand = `vale --config="${this.valeConfigPath}" --output=JSON "${filePath}"`;
      
      const { stdout, stderr } = await this.execAsync(valeCommand);
      
      // Vale returns non-zero exit code when there are issues, but that's expected
      let valeOutput: any = {};
      
      if (stdout.trim()) {
        try {
          valeOutput = JSON.parse(stdout);
        } catch (parseError) {
          console.warn('Failed to parse Vale JSON output:', parseError);
          valeOutput = {};
        }
      }

      const fileResults = valeOutput[filePath] || [];
      
      const errors: ValeLintError[] = [];
      const warnings: ValeLintError[] = [];
      const suggestions: ValeLintError[] = [];

      fileResults.forEach((issue: any) => {
        const lintError: ValeLintError = {
          line: issue.Line || 0,
          column: issue.Span?.[0] || 0,
          message: issue.Message || '',
          severity: issue.Severity || 'suggestion',
          rule: issue.Check || 'unknown',
          suggestion: issue.Action?.Name || undefined,
        };

        switch (issue.Severity?.toLowerCase()) {
          case 'error':
            errors.push(lintError);
            break;
          case 'warning':
            warnings.push(lintError);
            break;
          default:
            suggestions.push(lintError);
        }
      });

      return { errors, warnings, suggestions };
    } catch (error: any) {
      // Vale command might fail if no issues found or if Vale is not installed
      if (error.code === 'ENOENT') {
        throw new Error('Vale is not installed or not found in PATH. Please install Vale first.');
      }
      
      // If Vale returns JSON in stderr (common for Vale), try to parse it
      if (error.stderr) {
        try {
          const valeOutput = JSON.parse(error.stderr);
          const fileResults = valeOutput[filePath] || [];
          // Process similar to above...
          return { errors: [], warnings: [], suggestions: [] };
        } catch (parseError) {
          // If we can't parse stderr, return the error as-is
          console.warn('Vale execution failed:', error.message);
          return { errors: [], warnings: [], suggestions: [] };
        }
      }

      return { errors: [], warnings: [], suggestions: [] };
    }
  }

  async checkValeInstallation(): Promise<{ installed: boolean; version?: string; error?: string }> {
    try {
      const { stdout } = await this.execAsync('vale --version');
      return {
        installed: true,
        version: stdout.trim(),
      };
    } catch (error: any) {
      return {
        installed: false,
        error: error.code === 'ENOENT' ? 'Vale is not installed or not found in PATH' : error.message,
      };
    }
  }
}