export const baseEmailTemplate = (content: string): string => `
<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      background-color: #f5f5f5;
    }
    .email-container {
      background-color: white;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      padding: 40px;
    }
    .header {
      border-bottom: 2px solid #4CAF50;
      padding-bottom: 20px;
      margin-bottom: 30px;
    }
    .logo {
      font-size: 24px;
      font-weight: bold;
      color: #4CAF50;
    }
    h1 {
      color: #2c3e50;
      margin-top: 0;
    }
    .button {
      display: inline-block;
      padding: 12px 24px;
      background-color: #4CAF50;
      color: white;
      text-decoration: none;
      border-radius: 5px;
      font-weight: bold;
      margin: 20px 0;
    }
    .button:hover {
      background-color: #45a049;
    }
    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #e0e0e0;
      font-size: 14px;
      color: #666;
      text-align: center;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 20px 0;
    }
    th, td {
      padding: 12px;
      text-align: left;
      border-bottom: 1px solid #e0e0e0;
    }
    th {
      background-color: #f8f9fa;
      font-weight: 600;
    }
    .alert {
      padding: 15px;
      border-radius: 5px;
      margin: 20px 0;
    }
    .alert-critical {
      background-color: #ffebee;
      border-left: 4px solid #f44336;
      color: #c62828;
    }
    .alert-warning {
      background-color: #fff3e0;
      border-left: 4px solid #ff9800;
      color: #e65100;
    }
    .alert-info {
      background-color: #e3f2fd;
      border-left: 4px solid #2196f3;
      color: #0d47a1;
    }
    .alert-success {
      background-color: #e8f5e9;
      border-left: 4px solid #4caf50;
      color: #2e7d32;
    }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="header">
      <div class="logo">EN13813 Compliance Management</div>
    </div>
    ${content}
    <div class="footer">
      <p>© ${new Date().getFullYear()} EN13813 Compliance Management System</p>
      <p>Diese E-Mail wurde automatisch generiert. Bitte antworten Sie nicht auf diese E-Mail.</p>
      <p>Bei Fragen wenden Sie sich bitte an Ihren Administrator.</p>
    </div>
  </div>
</body>
</html>
`