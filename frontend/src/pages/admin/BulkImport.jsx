import { useState } from 'react';
import { bulkImportQuestions } from '@/api/admin';
import { Button } from '@/components/ui/Button';
import { Upload, FileText, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function BulkImport() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      setFile(selected);
      parseFile(selected);
    }
  };

  const parseFile = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target.result;
        let data = [];
        
        if (file.name.endsWith('.json')) {
          data = JSON.parse(text);
          if (!Array.isArray(data)) throw new Error("JSON must be an array of objects");
        } else if (file.name.endsWith('.csv')) {
           // Basic CSV parsing (assuming no commas in quotes for this simple version)
           const lines = text.split('\n');
           const headers = lines[0].split(',').map(h => h.trim());
           for (let i = 1; i < lines.length; i++) {
             if (!lines[i].trim()) continue;
             const values = lines[i].split(',');
             const obj = {};
             headers.forEach((h, j) => {
                obj[h] = values[j] ? values[j].trim() : '';
             });
             // format options
             obj.options = [
               { label: 'A', text: obj.optionA || '' },
               { label: 'B', text: obj.optionB || '' },
               { label: 'C', text: obj.optionC || '' },
               { label: 'D', text: obj.optionD || '' }
             ];
             if(obj.companies) obj.companies = obj.companies.split(';').filter(Boolean);
             if(obj.tags) obj.tags = obj.tags.split(';').filter(Boolean);
             data.push(obj);
           }
        } else {
          throw new Error("Unsupported file type");
        }

        validateData(data);
      } catch (err) {
        alert("Error parsing file: " + err.message);
        setFile(null);
        setPreview(null);
      }
    };
    reader.readAsText(file);
  };

  const validateData = (data) => {
    const REQUIRED = ['text', 'correctOption', 'explanation', 'topic', 'difficulty'];
    const validated = data.map((row, index) => {
      const missing = REQUIRED.filter(f => !row[f]);
      const validOptions = row.options && row.options.length === 4 && row.options.every(o => o.text);
      return {
        _raw: row,
        index: index + 1,
        isValid: missing.length === 0 && validOptions,
        errors: [...missing.map(m => `Missing ${m}`), ...(!validOptions ? ['Invalid options'] : [])]
      };
    });
    setPreview(validated);
    setResults(null);
  };

  const handleImport = async () => {
    if (!preview) return;
    const validRows = preview.filter(p => p.isValid).map(p => p._raw);
    
    if (validRows.length === 0) {
      alert("No valid rows to import");
      return;
    }

    try {
      setLoading(true);
      const res = await bulkImportQuestions(validRows);
      setResults(res.data);
      setPreview(null);
      setFile(null);
    } catch (err) {
      alert("Import failed: " + (err.response?.data?.error?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const validCount = preview?.filter(p => p.isValid).length || 0;
  const invalidCount = preview?.filter(p => !p.isValid).length || 0;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Bulk Import Questions</h1>
        <p className="text-muted-foreground mt-1">Upload a JSON or CSV file to import multiple questions at once.</p>
      </div>

      {!results && (
        <div className="bg-card border border-border rounded-xl p-8 text-center shadow-sm">
          <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-bold mb-2">Upload File</h3>
          <p className="text-sm text-muted-foreground mb-6">Supports .json and .csv formats.</p>
          
          <input
            type="file"
            id="file-upload"
            className="hidden"
            accept=".json,.csv"
            onChange={handleFileChange}
          />
          <label htmlFor="file-upload">
            <Button as="span" className="cursor-pointer">Select File</Button>
          </label>

          <div className="mt-8 text-left max-w-lg mx-auto bg-secondary/30 p-4 rounded-lg text-sm text-muted-foreground">
            <p className="font-semibold text-foreground mb-2">CSV Format Expected Headers:</p>
            <code>text, optionA, optionB, optionC, optionD, correctOption, explanation, topic, subTopic, difficulty, companies (semicolon sep), tags (semicolon sep)</code>
          </div>
        </div>
      )}

      {preview && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-card p-4 rounded-xl border border-border shadow-sm">
            <div className="flex gap-6">
              <div>
                <p className="text-sm text-muted-foreground">Total Rows</p>
                <p className="text-2xl font-bold">{preview.length}</p>
              </div>
              <div>
                <p className="text-sm text-green-500">Valid</p>
                <p className="text-2xl font-bold text-green-500">{validCount}</p>
              </div>
              <div>
                <p className="text-sm text-red-500">Invalid</p>
                <p className="text-2xl font-bold text-red-500">{invalidCount}</p>
              </div>
            </div>
            <Button onClick={handleImport} disabled={validCount === 0 || loading} isLoading={loading}>
              Import {validCount} Questions
            </Button>
          </div>

          <div className="border border-border rounded-xl overflow-hidden bg-card">
            <div className="overflow-x-auto max-h-[500px]">
              <table className="w-full text-sm text-left">
                <thead className="bg-secondary/50 text-muted-foreground sticky top-0">
                  <tr>
                    <th className="px-4 py-3 font-medium">Row</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium">Question Text</th>
                    <th className="px-4 py-3 font-medium">Errors</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {preview.map((row) => (
                    <tr key={row.index} className={!row.isValid ? 'bg-red-500/5' : ''}>
                      <td className="px-4 py-3 text-muted-foreground">{row.index}</td>
                      <td className="px-4 py-3">
                        {row.isValid 
                          ? <CheckCircle2 className="w-5 h-5 text-green-500" />
                          : <XCircle className="w-5 h-5 text-red-500" />
                        }
                      </td>
                      <td className="px-4 py-3">
                        <div className="line-clamp-1">{row._raw.text || <span className="text-muted-foreground italic">Missing text</span>}</div>
                      </td>
                      <td className="px-4 py-3 text-red-500 text-xs">
                        {row.errors.join(', ')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {results && (
        <div className="bg-card border border-border rounded-xl p-8 text-center shadow-sm">
          <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8 text-green-500" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Import Complete</h2>
          <p className="text-muted-foreground mb-6">
            Successfully imported {results.imported} questions. Skipped {results.skipped} invalid rows.
          </p>
          <div className="flex justify-center gap-4">
            <Button onClick={() => setResults(null)}>Import More</Button>
            <Link to="/admin/questions">
              <Button variant="outline">View Question Bank</Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
