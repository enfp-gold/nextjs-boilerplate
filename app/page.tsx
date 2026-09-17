'use client';

import { useState, FormEvent } from 'react';

interface VerifyResult {
  verified: boolean;
  message?: string;
  error?: string;
  leafHash?: string;
  computedRoot?: string;
  providedRoot?: string;
}

export default function Home() {
  const [merkleRoot, setMerkleRoot] = useState<string>('');
  const [eventData, setEventData] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<VerifyResult | null>(null);

  const WORKER_URL = 'https://divine-king-6d02.playerno-68.workers.dev';

  const handleVerify = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      let parsedData: unknown;
      try {
        parsedData = JSON.parse(eventData);
      } catch {
        parsedData = eventData.trim();
      }

      const response = await fetch(`${WORKER_URL}/api/merkle/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetEvent: parsedData,
          merkleRoot: merkleRoot.trim(),
        }),
      });

      const data: VerifyResult = await response.json();
      setResult(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setResult({
        verified: false,
        error: 'Failed to connect to verification server: ' + errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{ minHeight: '100vh', background: '#f8fafc', padding: '40px 20px', fontFamily: 'sans-serif' }}>
      <div style={{
        background: '#ffffff',
        borderRadius: '16px',
        padding: '24px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
        border: '1px solid #eef2f6',
        maxWidth: '650px',
        margin: '0 auto'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
          <span style={{ fontSize: '24px' }}>🔍</span>
          <div>
            <h3 style={{ margin: 0, fontSize: '18px', color: '#1e293b' }}>Public Merkle Verifier</h3>
            <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#64748b' }}>
              Verify cryptographic inclusion proof against ledger state
            </p>
          </div>
        </div>

        <form onSubmit={handleVerify}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#475569', marginBottom: '6px' }}>
              MERKLE ROOT STAMP (0x...)
            </label>
            <input
              type="text"
              required
              placeholder="0x9e842793e4ba17dc40f1cc913d26627f..."
              value={merkleRoot}
              onChange={(e) => setMerkleRoot(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: '13px',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#475569', marginBottom: '6px' }}>
              TARGET EVENT DATA (JSON or String Payload)
            </label>
            <textarea
              rows={4}
              required
              placeholder='{"id": 51, "user_id": "4d6369bd...", "type": "community_action", "metadata": null}'
              value={eventData}
              onChange={(e) => setEventData(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: '13px',
                fontFamily: 'monospace',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: '8px',
              border: 'none',
              background: loading ? '#94a3b8' : '#0284c7',
              color: '#fff',
              fontWeight: 'bold',
              fontSize: '14px',
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? 'VERIFYING PROOF...' : 'CHECK CRYPTOGRAPHIC PROOF'}
          </button>
        </form>

        {result && (
          <div style={{
            marginTop: '20px',
            padding: '16px',
            borderRadius: '10px',
            backgroundColor: result.verified ? '#f0fdf4' : '#fef2f2',
            border: `1px solid ${result.verified ? '#bbf7d0' : '#fecaca'}`,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <span style={{ fontSize: '18px' }}>{result.verified ? '✅' : '❌'}</span>
              <strong style={{ color: result.verified ? '#15803d' : '#b91c1c', fontSize: '14px' }}>
                {result.verified ? 'Verification Passed' : 'Verification Failed'}
              </strong>
            </div>
            
            <p style={{ margin: '0 0 10px', fontSize: '13px', color: result.verified ? '#166534' : '#991b1b' }}>
              {result.message || result.error}
            </p>

            {result.leafHash && (
              <div style={{ fontSize: '11px', color: '#475569', fontFamily: 'monospace', wordBreak: 'break-all' }}>
                <div><strong>Leaf Hash:</strong> {result.leafHash}</div>
                <div><strong>Computed Root:</strong> {result.computedRoot}</div>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
