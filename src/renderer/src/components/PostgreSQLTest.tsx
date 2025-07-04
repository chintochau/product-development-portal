import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Database, CheckCircle, XCircle, Loader2 } from 'lucide-react';

interface ConnectionInfo {
  connected: boolean;
  currentTime?: Date;
  version?: string;
  database?: string;
  host?: string;
  port?: number;
  error?: string;
}

export function PostgreSQLTest() {
  const [connectionInfo, setConnectionInfo] = useState<ConnectionInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [tables, setTables] = useState<string[]>([]);

  const testConnection = async () => {
    setLoading(true);
    try {
      const result = await window.api.invoke('postgresql:test-connection');
      setConnectionInfo(result);
      
      if (result.connected) {
        // Also check for existing tables
        const tablesResult = await window.api.invoke('postgresql:check-tables');
        if (tablesResult.success) {
          setTables(tablesResult.tables || []);
        }
      }
    } catch (error) {
      setConnectionInfo({
        connected: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          PostgreSQL Connection Test
        </CardTitle>
        <CardDescription>
          Test the connection to your PostgreSQL database
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button 
          onClick={testConnection} 
          disabled={loading}
          className="w-full"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Testing Connection...
            </>
          ) : (
            'Test Connection'
          )}
        </Button>

        {connectionInfo && (
          <Alert className={connectionInfo.connected ? 'border-green-500' : 'border-red-500'}>
            <div className="flex items-start gap-2">
              {connectionInfo.connected ? (
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
              ) : (
                <XCircle className="h-5 w-5 text-red-500 mt-0.5" />
              )}
              <AlertDescription className="space-y-2 flex-1">
                <p className="font-semibold">
                  {connectionInfo.connected ? 'Connection Successful!' : 'Connection Failed'}
                </p>
                {connectionInfo.connected ? (
                  <>
                    <div className="text-sm space-y-1 text-muted-foreground">
                      <p><strong>Database:</strong> {connectionInfo.database}</p>
                      <p><strong>Host:</strong> {connectionInfo.host}:{connectionInfo.port}</p>
                      <p><strong>PostgreSQL Version:</strong> {connectionInfo.version?.split('\n')[0]}</p>
                      <p><strong>Server Time:</strong> {new Date(connectionInfo.currentTime!).toLocaleString()}</p>
                    </div>
                    {tables.length > 0 && (
                      <div className="mt-3">
                        <p className="font-semibold text-sm">Existing Tables ({tables.length}):</p>
                        <div className="mt-1 text-sm text-muted-foreground">
                          {tables.join(', ')}
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <p className="text-sm text-red-600">
                    Error: {connectionInfo.error}
                  </p>
                )}
              </AlertDescription>
            </div>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}