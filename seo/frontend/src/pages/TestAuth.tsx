import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

const TestAuth: React.FC = () => {
  const { companyLogin, companySignup } = useAuth();
  const [email, setEmail] = useState('testcompany@example.com');
  const [password, setPassword] = useState('testpassword123');
  const [result, setResult] = useState('');

  const testLogin = async () => {
    try {
      setResult('Testing login...');
      const success = await companyLogin(email, password);
      setResult(`Login result: ${success}`);
    } catch (error: any) {
      setResult(`Login error: ${error.message}`);
    }
  };

  const testSignup = async () => {
    try {
      setResult('Testing signup...');
      const success = await companySignup({
        email: `test${Date.now()}@example.com`,
        password: 'testpassword123',
        companyName: 'Test Company',
        industry: 'Technology',
        location: 'Remote'
      });
      setResult(`Signup result: ${success}`);
    } catch (error: any) {
      setResult(`Signup error: ${error.message}`);
    }
  };

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Authentication Test</h1>
      
      <div className="space-y-4 mb-6">
        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-2 border rounded"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-2 border rounded"
          />
        </div>
      </div>

      <div className="flex gap-4 mb-6">
        <button
          onClick={testLogin}
          className="px-4 py-2 bg-blue-600 text-white rounded"
        >
          Test Login
        </button>
        <button
          onClick={testSignup}
          className="px-4 py-2 bg-green-600 text-white rounded"
        >
          Test Signup
        </button>
      </div>

      {result && (
        <div className="p-4 bg-gray-100 rounded">
          <pre>{result}</pre>
        </div>
      )}
    </div>
  );
};

export default TestAuth;
