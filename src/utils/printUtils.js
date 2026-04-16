import { formatCurrency, formatDate, formatTime } from './helpers';

// ==================== CORE PRINT FUNCTION ====================
const printDocument = (content, title = 'Print', customCss = '') => {
  const win = window.open('', '_blank', 'width=900,height=700');
  
  const defaultCss = `
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', Arial, sans-serif; background: white; padding: 30px; max-width: 1000px; margin: 0 auto; color: #1a1a1a; font-size: 13px; }
    .print-container { background: white; padding: 20px; }
    .header { text-align: center; margin-bottom: 25px; padding-bottom: 15px; border-bottom: 2px solid #333; }
    .header h1 { font-size: 26px; font-weight: bold; margin-bottom: 5px; text-transform: uppercase; }
    .header .company { font-size: 18px; font-weight: 600; color: #444; }
    .header .date { font-size: 13px; color: #666; margin-top: 5px; }
    .section { margin: 20px 0; }
    .section-title { font-size: 16px; font-weight: bold; border-bottom: 1px solid #999; padding-bottom: 5px; margin-bottom: 12px; }
    table { width: 100%; border-collapse: collapse; margin: 15px 0; font-size: 13px; }
    th { background: #e9e9e9; padding: 8px 6px; text-align: left; font-weight: bold; border: 1px solid #aaa; }
    td { padding: 6px; border: 1px solid #ccc; }
    .text-right { text-align: right; }
    .text-center { text-align: center; }
    .total-row { font-weight: bold; background: #f0f0f0; border-top: 2px solid #333; }
    .amount-positive { color: #15803d; }
    .amount-negative { color: #b91c1c; }
    .footer { margin-top: 30px; padding-top: 15px; border-top: 1px solid #aaa; text-align: center; font-size: 11px; color: #555; }
    .signature-line { display: flex; justify-content: space-between; margin-top: 40px; }
    .signature-item { text-align: center; width: 180px; }
    .signature-item .line { margin-top: 8px; border-top: 1px solid #333; padding-top: 4px; }
    .info-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; margin: 15px 0; }
    .info-item { padding: 8px 10px; background: #f5f5f5; border-radius: 4px; }
    .info-label { font-size: 11px; color: #555; }
    .info-value { font-size: 14px; font-weight: 600; }
    .badge { display: inline-block; padding: 3px 8px; border-radius: 12px; font-size: 11px; font-weight: 600; }
    .badge-success { background: #dcfce7; color: #15803d; }
    .badge-warning { background: #fef3c7; color: #b45309; }
    .badge-danger { background: #fee2e2; color: #b91c1c; }
    @media print { body { padding: 0.3in; } }
  `;
  
  win.document.write(`
    <!DOCTYPE html><html><head><title>${title}</title><meta charset="UTF-8"><style>${defaultCss}${customCss}</style></head>
    <body><div class="print-container">${content}</div><div class="footer">Printed: ${new Date().toLocaleString()}</div></body></html>
  `);
  win.document.close();
  win.focus();
  setTimeout(() => win.print(), 300);
};

// ==================== SETTINGS HELPER ====================
const getMainAppName = () => {
  try {
    const mainSettings = JSON.parse(localStorage.getItem('mainSettings') || '{}');
    return mainSettings.general?.appName || 'ERP System';
  } catch {
    return 'ERP System';
  }
};

const getCombinedName = (moduleName) => {
  return `${getMainAppName()} - ${moduleName}`;
};

// ==================== STAFF PRINTS ====================
export const printEmployeeDetails = (employee, moduleName = 'Staff Manager') => {
  const combinedName = getCombinedName(moduleName);
  const content = `
    <div class="header"><h1>EMPLOYEE DETAILS</h1><div class="company">${combinedName}</div><div class="date">Generated: ${new Date().toLocaleString()}</div></div>
    <div class="section"><h2 class="section-title">Personal Info</h2><div class="info-grid"><div class="info-item"><div class="info-label">Name</div><div class="info-value">${employee.firstName} ${employee.lastName}</div></div><div class="info-item"><div class="info-label">ID</div><div class="info-value">${employee.employeeId}</div></div><div class="info-item"><div class="info-label">Email</div><div class="info-value">${employee.email || '-'}</div></div><div class="info-item"><div class="info-label">Phone</div><div class="info-value">${employee.phone || '-'}</div></div></div></div>
    <div class="section"><h2 class="section-title">Employment</h2><div class="info-grid"><div class="info-item"><div class="info-label">Department</div><div class="info-value">${employee.department?.name || '-'}</div></div><div class="info-item"><div class="info-label">Position</div><div class="info-value">${employee.position || '-'}</div></div><div class="info-item"><div class="info-label">Join Date</div><div class="info-value">${formatDate(employee.joinDate)}</div></div><div class="info-item"><div class="info-label">Salary</div><div class="info-value amount-positive">${formatCurrency(employee.baseSalary)}</div></div></div></div>
    <div class="signature-line"><div class="signature-item"><div class="line"></div><p>HR Signature</p></div><div class="signature-item"><div class="line"></div><p>Date</p></div></div>
  `;
  printDocument(content, `Employee - ${employee.firstName} ${employee.lastName}`);
};

export const printEmployeeList = (employees, filters = {}, moduleName = 'Staff Manager') => {
  const combinedName = getCombinedName(moduleName);
  const rows = employees.map(e => `<tr><td>${e.employeeId}</td><td>${e.firstName} ${e.lastName}</td><td>${e.department?.name || '-'}</td><td>${e.position || '-'}</td><td class="text-right">${formatCurrency(e.baseSalary)}</td></tr>`).join('');
  const content = `<div class="header"><h1>EMPLOYEE LIST</h1><div class="company">${combinedName}</div></div><table><thead><tr><th>ID</th><th>Name</th><th>Dept</th><th>Position</th><th>Salary</th></tr></thead><tbody>${rows}</tbody></table><p>Total: ${employees.length}</p>`;
  printDocument(content, 'Employee List');
};

export const printPayslip = (payroll, staff, moduleName = 'Staff Manager') => {
  const combinedName = getCombinedName(moduleName);
  const totalAllow = Object.values(payroll.allowances || {}).reduce((a,b) => a + (b||0), 0);
  const totalDed = Object.values(payroll.deductions || {}).reduce((a,b) => a + (b||0), 0);
  const gross = payroll.basicSalary + totalAllow + (payroll.overtimePay||0) + (payroll.bonus||0);
  const content = `
    <div class="header"><h1>PAYSLIP</h1><div class="company">${combinedName}</div><div>${formatDate(payroll.period?.startDate)} - ${formatDate(payroll.period?.endDate)}</div></div>
    <div class="section"><div class="info-grid"><div class="info-item"><div class="info-label">Employee</div><div class="info-value">${staff.firstName} ${staff.lastName}</div></div><div class="info-item"><div class="info-label">ID</div><div class="info-value">${staff.employeeId}</div></div></div></div>
    <table><tr><th>Earnings</th><th class="text-right">Amount</th></tr><tr><td>Basic Salary</td><td class="text-right">${formatCurrency(payroll.basicSalary)}</td></tr>${payroll.allowances?.housing?`<tr><td>Housing</td><td class="text-right">${formatCurrency(payroll.allowances.housing)}</td></tr>`:''}${payroll.overtimePay?`<tr><td>Overtime</td><td class="text-right">${formatCurrency(payroll.overtimePay)}</td></tr>`:''}<tr class="total-row"><td>Gross Pay</td><td class="text-right">${formatCurrency(gross)}</td></tr></table>
    <table><tr><th>Deductions</th><th class="text-right">Amount</th></tr>${payroll.deductions?.tax?`<tr><td>Tax</td><td class="text-right">${formatCurrency(payroll.deductions.tax)}</td></tr>`:''}<tr class="total-row"><td>Total Deductions</td><td class="text-right">${formatCurrency(totalDed)}</td></tr></table>
    <div style="text-align:center;margin:20px;padding:15px;background:#e8e8e8;font-size:20px;font-weight:bold;">NET PAY: ${formatCurrency(payroll.netSalary)}</div>
    <div class="signature-line"><div class="signature-item"><div class="line"></div><p>Authorized</p></div></div>
  `;
  printDocument(content, `Payslip - ${staff.firstName} ${staff.lastName}`);
};

export const printAttendanceReport = (employee, records, filters = {}, moduleName = 'Staff Manager') => {
  const combinedName = getCombinedName(moduleName);
  const rows = records.map(r => `<tr><td>${formatDate(r.date)}</td><td>${r.checkIn?formatTime(r.checkIn):'-'}</td><td>${r.checkOut?formatTime(r.checkOut):'-'}</td><td class="text-right">${r.totalHours?.toFixed(2)||'-'}</td></tr>`).join('');
  const totalHrs = records.reduce((s,r)=>s+(r.totalHours||0),0);
  const content = `<div class="header"><h1>ATTENDANCE REPORT</h1><div class="company">${combinedName}</div><p>${employee?.firstName} ${employee?.lastName} (${employee?.employeeId})</p></div><table><thead><tr><th>Date</th><th>In</th><th>Out</th><th>Hours</th></tr></thead><tbody>${rows}</tbody><tfoot><tr class="total-row"><td colspan="3">Total</td><td class="text-right">${totalHrs.toFixed(2)}</td></tr></tfoot></table>`;
  printDocument(content, `Attendance - ${employee?.firstName} ${employee?.lastName}`);
};

export const printLeaveNote = (leave, moduleName = 'Staff Manager') => {
  const combinedName = getCombinedName(moduleName);
  const content = `
    <div class="header"><h1>LEAVE APPLICATION</h1><div class="company">${combinedName}</div></div>
    <div class="section"><div class="info-grid"><div class="info-item"><div class="info-label">Employee</div><div class="info-value">${leave.staffId?.firstName} ${leave.staffId?.lastName}</div></div><div class="info-item"><div class="info-label">Type</div><div class="info-value">${leave.leaveType}</div></div><div class="info-item"><div class="info-label">Dates</div><div class="info-value">${formatDate(leave.startDate)} - ${formatDate(leave.endDate)}</div></div><div class="info-item"><div class="info-label">Days</div><div class="info-value">${leave.daysCount}</div></div></div></div>
    <div class="section"><h2 class="section-title">Reason</h2><p>${leave.reason || '-'}</p></div>
    <div class="section"><h2 class="section-title">Status</h2><p><span class="badge ${leave.status==='approved'?'badge-success':leave.status==='rejected'?'badge-danger':'badge-warning'}">${leave.status?.toUpperCase()}</span></p></div>
    <div class="signature-line"><div class="signature-item"><div class="line"></div><p>Employee</p></div><div class="signature-item"><div class="line"></div><p>Manager</p></div></div>
  `;
  printDocument(content, `Leave - ${leave.staffId?.firstName} ${leave.staffId?.lastName}`);
};

export const printPerformanceReport = (review, moduleName = 'Staff Manager') => {
  const combinedName = getCombinedName(moduleName);
  const stars = (r) => '★'.repeat(Math.round(r)) + '☆'.repeat(5-Math.round(r));
  const catRows = review.categories?.map(c => `<tr><td>${c.name}</td><td class="text-center">${stars(c.rating)} (${c.rating}/5)</td></tr>`).join('') || '<tr><td colspan="2">No categories</td></tr>';
  const content = `
    <div class="header"><h1>PERFORMANCE REVIEW</h1><div class="company">${combinedName}</div></div>
    <div class="section"><div class="info-grid"><div class="info-item"><div class="info-label">Employee</div><div class="info-value">${review.staffId?.firstName} ${review.staffId?.lastName}</div></div><div class="info-item"><div class="info-label">Review Date</div><div class="info-value">${formatDate(review.reviewDate)}</div></div></div></div>
    <div class="section"><h2 class="section-title">Overall Rating</h2><div style="text-align:center;font-size:36px;color:#eab308;">${stars(review.rating)}</div><p style="text-align:center;font-size:20px;">${review.rating||0}/5</p></div>
    <div class="section"><h2 class="section-title">Categories</h2><table><thead><tr><th>Category</th><th>Rating</th></tr></thead><tbody>${catRows}</tbody></table></div>
    ${review.strengths?`<div class="section"><h2 class="section-title">Strengths</h2><p>${review.strengths}</p></div>`:''}
    ${review.improvements?`<div class="section"><h2 class="section-title">Improvements</h2><p>${review.improvements}</p></div>`:''}
    <div class="signature-line"><div class="signature-item"><div class="line"></div><p>Reviewer</p></div><div class="signature-item"><div class="line"></div><p>Employee</p></div></div>
  `;
  printDocument(content, `Review - ${review.staffId?.firstName} ${review.staffId?.lastName}`);
};

// ==================== FINANCE PRINTS ====================
export const printTransactionReceipt = (transaction, moduleName = 'Finance Manager') => {
  const combinedName = getCombinedName(moduleName);
  const content = `
    <div class="header"><h1>TRANSACTION RECEIPT</h1><div class="company">${combinedName}</div></div>
    <div class="info-grid"><div class="info-item"><div class="info-label">ID</div><div class="info-value">${transaction.transactionId}</div></div><div class="info-item"><div class="info-label">Date</div><div class="info-value">${formatDate(transaction.date)} ${formatTime(transaction.date)}</div></div></div>
    <table><tr><td>Description</td><td>${transaction.description}</td></tr><tr><td>Amount</td><td class="${transaction.amount<0?'amount-negative':'amount-positive'}" style="font-size:24px;">${formatCurrency(transaction.amount)}</td></tr></table>
    <div class="signature-line"><div class="signature-item"><div class="line"></div><p>Authorized</p></div></div>
  `;
  printDocument(content, `Transaction - ${transaction.transactionId}`);
};

export const printTransactionList = (transactions, filters = {}, moduleName = 'Finance Manager') => {
  const combinedName = getCombinedName(moduleName);
  const rows = transactions.map(t => `<tr><td>${formatDate(t.date)}</td><td>${t.description}</td><td>${t.type}</td><td class="text-right ${t.amount<0?'amount-negative':'amount-positive'}">${formatCurrency(t.amount)}</td></tr>`).join('');
  const totalIn = transactions.filter(t=>t.amount>0).reduce((s,t)=>s+t.amount,0);
  const totalEx = transactions.filter(t=>t.amount<0).reduce((s,t)=>s+Math.abs(t.amount),0);
  const content = `<div class="header"><h1>TRANSACTION REPORT</h1><div class="company">${combinedName}</div></div><table><thead><tr><th>Date</th><th>Description</th><th>Type</th><th>Amount</th></tr></thead><tbody>${rows}</tbody><tfoot><tr><td colspan="3">Total Income</td><td class="text-right amount-positive">${formatCurrency(totalIn)}</td></tr><tr><td colspan="3">Total Expenses</td><td class="text-right amount-negative">${formatCurrency(totalEx)}</td></tr><tr class="total-row"><td colspan="3">Net</td><td class="text-right">${formatCurrency(totalIn-totalEx)}</td></tr></tfoot></table>`;
  printDocument(content, 'Transaction Report');
};

export const printExpenseList = (expenses, moduleName = 'Finance Manager') => {
  const combinedName = getCombinedName(moduleName);
  const rows = expenses.map(e => `<tr><td>${e.expenseNumber}</td><td>${formatDate(e.date)}</td><td>${e.category}</td><td>${e.description}</td><td class="text-right amount-negative">${formatCurrency(e.amount)}</td></tr>`).join('');
  const total = expenses.reduce((s,e)=>s+e.amount,0);
  const content = `<div class="header"><h1>EXPENSE REPORT</h1><div class="company">${combinedName}</div></div><table><thead><tr><th>Expense #</th><th>Date</th><th>Category</th><th>Description</th><th>Amount</th></tr></thead><tbody>${rows}</tbody><tfoot><tr class="total-row"><td colspan="4">Total</td><td class="text-right">${formatCurrency(total)}</td></tr></tfoot></table>`;
  printDocument(content, 'Expense Report');
};

export const printIncomeList = (incomes, moduleName = 'Finance Manager') => {
  const combinedName = getCombinedName(moduleName);
  const rows = incomes.map(i => `<tr><td>${i.incomeNumber}</td><td>${formatDate(i.date)}</td><td>${i.source}</td><td>${i.description}</td><td class="text-right amount-positive">${formatCurrency(i.amount)}</td></tr>`).join('');
  const total = incomes.reduce((s,i)=>s+i.amount,0);
  const content = `<div class="header"><h1>INCOME REPORT</h1><div class="company">${combinedName}</div></div><table><thead><tr><th>Income #</th><th>Date</th><th>Source</th><th>Description</th><th>Amount</th></tr></thead><tbody>${rows}</tbody><tfoot><tr class="total-row"><td colspan="4">Total</td><td class="text-right">${formatCurrency(total)}</td></tr></tfoot></table>`;
  printDocument(content, 'Income Report');
};

export const printFinancialReport = (title, data, period = {}, moduleName = 'Finance Manager') => {
  const combinedName = getCombinedName(moduleName);
  let reportContent = '';
  if (title.includes('Profit')) {
    reportContent = `<table><tr><td>Revenue</td><td class="text-right">${formatCurrency(data.revenue||0)}</td></tr><tr><td>Expenses</td><td class="text-right">${formatCurrency(data.expenses||0)}</td></tr><tr><td>Payroll</td><td class="text-right">${formatCurrency(data.payroll||0)}</td></tr><tr class="total-row"><td>Net Profit</td><td class="text-right">${formatCurrency(data.netProfit||0)}</td></tr></table>`;
  } else if (title.includes('Balance')) {
    reportContent = `<table><tr><td>Assets</td><td class="text-right">${formatCurrency(data.assets||0)}</td></tr><tr><td>Liabilities</td><td class="text-right">${formatCurrency(data.liabilities||0)}</td></tr><tr><td>Equity</td><td class="text-right">${formatCurrency(data.equity||0)}</td></tr></table>`;
  } else {
    reportContent = `<table><tr><td>Operating Cash Flow</td><td class="text-right">${formatCurrency(data.operatingCashFlow||0)}</td></tr><tr class="total-row"><td>Net Cash Flow</td><td class="text-right">${formatCurrency(data.netCashFlow||0)}</td></tr></table>`;
  }
  const periodDisplay = (period.startDate && period.endDate) ? `<p><strong>Period:</strong> ${formatDate(period.startDate)} - ${formatDate(period.endDate)}</p>` : '';
  const content = `<div class="header"><h1>${title}</h1><div class="company">${combinedName}</div>${periodDisplay}</div>${reportContent}<div class="signature-line"><div class="signature-item"><div class="line"></div><p>Prepared By</p></div></div>`;
  printDocument(content, title);
};

export const printBudgetReport = (budget, moduleName = 'Finance Manager') => {
  const combinedName = getCombinedName(moduleName);
  const rows = budget.categories?.map(c => `<tr><td>${c.category}</td><td class="text-right">${formatCurrency(c.allocated||0)}</td><td class="text-right">${formatCurrency(c.spent||0)}</td><td class="text-right">${formatCurrency((c.allocated||0)-(c.spent||0))}</td></tr>`).join('') || '<tr><td colspan="4">No categories</td></tr>';
  const totalAlloc = budget.categories?.reduce((s,c)=>s+(c.allocated||0),0)||0;
  const totalSpent = budget.categories?.reduce((s,c)=>s+(c.spent||0),0)||0;
  const content = `<div class="header"><h1>BUDGET REPORT</h1><div class="company">${combinedName}</div><p>${budget.name} (${formatDate(budget.period?.startDate)} - ${formatDate(budget.period?.endDate)})</p></div><table><thead><tr><th>Category</th><th>Budgeted</th><th>Spent</th><th>Remaining</th></tr></thead><tbody>${rows}</tbody><tfoot><tr class="total-row"><td>Total</td><td class="text-right">${formatCurrency(totalAlloc)}</td><td class="text-right">${formatCurrency(totalSpent)}</td><td class="text-right">${formatCurrency(totalAlloc-totalSpent)}</td></tr></tfoot></table>`;
  printDocument(content, `Budget - ${budget.name}`);
};

export const printInvoice = (invoice, moduleName = 'Finance Manager') => {
  const combinedName = getCombinedName(moduleName);
  const items = invoice.items?.map(i => `<tr><td>${i.description}</td><td class="text-right">${i.quantity}</td><td class="text-right">${formatCurrency(i.unitPrice)}</td><td class="text-right">${formatCurrency(i.total)}</td></tr>`).join('') || '<tr><td colspan="4">No items</td></tr>';
  const content = `
    <div class="header"><h1>INVOICE</h1><div class="company">${combinedName}</div><div>Invoice #: ${invoice.invoiceNumber}</div></div>
    <div class="section"><div class="info-grid"><div class="info-item"><div class="info-label">Customer</div><div class="info-value">${invoice.customerName}</div></div><div class="info-item"><div class="info-label">Date</div><div class="info-value">${formatDate(invoice.invoiceDate)}</div></div><div class="info-item"><div class="info-label">Due Date</div><div class="info-value">${formatDate(invoice.dueDate)}</div></div><div class="info-item"><div class="info-label">Status</div><div class="info-value">${invoice.status}</div></div></div></div>
    <table><thead><tr><th>Description</th><th class="text-right">Qty</th><th class="text-right">Price</th><th class="text-right">Total</th></tr></thead><tbody>${items}</tbody></table>
    <div style="margin-top:20px;text-align:right;"><table style="width:300px;margin-left:auto;"><tr><td>Subtotal</td><td class="text-right">${formatCurrency(invoice.subtotal)}</td></tr>${invoice.tax>0?`<tr><td>Tax</td><td class="text-right">${formatCurrency(invoice.tax)}</td></tr>`:''}<tr class="total-row"><td>TOTAL</td><td class="text-right">${formatCurrency(invoice.total)}</td></tr></table></div>
    ${invoice.notes?`<p><strong>Notes:</strong> ${invoice.notes}</p>`:''}
    <div class="footer"><p>${invoice.terms || 'Thank you for your business!'}</p></div>
  `;
  printDocument(content, `Invoice - ${invoice.invoiceNumber}`);
};

export const printWithdrawalReceipt = (withdrawal, moduleName = 'Finance Manager') => {
  const combinedName = getCombinedName(moduleName);
  const content = `
    <div class="header"><h1>WITHDRAWAL RECEIPT</h1><div class="company">${combinedName}</div></div>
    <div class="info-grid"><div class="info-item"><div class="info-label">Date</div><div class="info-value">${formatDate(withdrawal.date)}</div></div><div class="info-item"><div class="info-label">Reference</div><div class="info-value">${withdrawal.reference||'-'}</div></div><div class="info-item"><div class="info-label">Account</div><div class="info-value">${withdrawal.accountId?.name||'-'}</div></div><div class="info-item"><div class="info-label">Method</div><div class="info-value">${withdrawal.paymentMethod}</div></div></div>
    <table><tr><td>Description</td><td>${withdrawal.description}</td></tr></table>
    <div style="text-align:center;margin:20px;padding:15px;background:#fee2e2;"><div style="font-size:14px;">AMOUNT</div><div style="font-size:32px;font-weight:bold;color:#b91c1c;">${formatCurrency(withdrawal.amount)}</div></div>
    <div class="signature-line"><div class="signature-item"><div class="line"></div><p>Authorized</p></div><div class="signature-item"><div class="line"></div><p>Received</p></div></div>
  `;
  printDocument(content, `Withdrawal - ${withdrawal.reference || withdrawal._id}`);
};

// ==================== ACCOUNT STATEMENT PRINT ====================
export const printAccountStatement = (account, transactions = [], moduleName = 'Finance Manager') => {
  const combinedName = getCombinedName(moduleName);
  const rows = transactions.map(t => {
    const isCredit = t.toAccount === account._id || t.type === 'income' || t.type === 'sale';
    const amount = isCredit ? t.amount : -t.amount;
    return `<tr><td>${formatDate(t.date)}</td><td>${t.description}</td><td>${t.type}</td><td class="text-right ${amount>=0?'amount-positive':'amount-negative'}">${formatCurrency(amount)}</td></tr>`;
  }).join('');
  
  let runningBalance = account.openingBalance || 0;
  const rowsWithBalance = transactions.map(t => {
    const isCredit = t.toAccount === account._id || t.type === 'income' || t.type === 'sale';
    runningBalance += isCredit ? t.amount : -t.amount;
    return `<tr><td>${formatDate(t.date)}</td><td>${t.description}</td><td>${t.type}</td><td class="text-right ${(isCredit?t.amount:-t.amount)>=0?'amount-positive':'amount-negative'}">${formatCurrency(isCredit?t.amount:-t.amount)}</td><td class="text-right">${formatCurrency(runningBalance)}</td></tr>`;
  }).join('');
  
  const content = `
    <div class="header"><h1>ACCOUNT STATEMENT</h1><div class="company">${combinedName}</div></div>
    <div class="section"><div class="info-grid"><div class="info-item"><div class="info-label">Account</div><div class="info-value">${account.name}</div></div><div class="info-item"><div class="info-label">Type</div><div class="info-value">${account.type}</div></div><div class="info-item"><div class="info-label">Currency</div><div class="info-value">${account.currency || 'KES'}</div></div><div class="info-item"><div class="info-label">Current Balance</div><div class="info-value amount-positive">${formatCurrency(account.balance, account.currency)}</div></div></div></div>
    <table><thead><tr><th>Date</th><th>Description</th><th>Type</th><th class="text-right">Amount</th><th class="text-right">Balance</th></tr></thead><tbody>${rowsWithBalance || '<tr><td colspan="5" class="text-center">No transactions</td></tr>'}</tbody></table>
    <div style="margin-top:20px;text-align:right;font-size:16px;font-weight:bold;">Closing Balance: ${formatCurrency(account.balance, account.currency)}</div>
    <div class="signature-line"><div class="signature-item"><div class="line"></div><p>Prepared By</p></div></div>
  `;
  printDocument(content, `Statement - ${account.name}`);
};

// ==================== POS PRINTS ====================
export const printReceipt = (sale, moduleName = 'POS System') => {
  const combinedName = getCombinedName(moduleName);
  const items = sale.items?.map(i => `<tr><td>${i.quantity} x ${i.name}</td><td class="text-right">${formatCurrency(i.total)}</td></tr>`).join('') || '<tr><td colspan="2">No items</td></tr>';
  const content = `
    <div class="header"><h1>SALE RECEIPT</h1><div class="company">${combinedName}</div><div>${formatDate(sale.date)} ${formatTime(sale.date)}</div></div>
    <div class="info-grid"><div class="info-item"><div class="info-label">Invoice #</div><div class="info-value">${sale.invoiceNumber}</div></div><div class="info-item"><div class="info-label">Payment</div><div class="info-value">${sale.paymentMethod}</div></div></div>
    <table><thead><tr><th>Item</th><th class="text-right">Amount</th></tr></thead><tbody>${items}</tbody></table>
    <div style="margin-top:15px;text-align:right;"><table style="width:250px;margin-left:auto;"><tr><td>Subtotal</td><td class="text-right">${formatCurrency(sale.subtotal)}</td></tr>${sale.taxTotal>0?`<tr><td>Tax</td><td class="text-right">${formatCurrency(sale.taxTotal)}</td></tr>`:''}<tr class="total-row"><td>TOTAL</td><td class="text-right">${formatCurrency(sale.grandTotal)}</td></tr><tr><td>Paid</td><td class="text-right">${formatCurrency(sale.amountPaid)}</td></tr><tr><td>Change</td><td class="text-right">${formatCurrency(sale.change)}</td></tr></table></div>
    <div style="text-align:center;margin-top:25px;"><p>Thank you!</p></div>
  `;
  printDocument(content, `Receipt - ${sale.invoiceNumber}`);
};

export const printProductList = (products, moduleName = 'POS System') => {
  const combinedName = getCombinedName(moduleName);
  const rows = products.map(p => `<tr><td>${p.sku}</td><td>${p.name}</td><td>${p.category?.name||'-'}</td><td class="text-right">${formatCurrency(p.price)}</td><td class="text-right">${p.quantity}</td></tr>`).join('');
  const content = `<div class="header"><h1>PRODUCT LIST</h1><div class="company">${combinedName}</div></div><table><thead><tr><th>SKU</th><th>Name</th><th>Category</th><th>Price</th><th>Stock</th></tr></thead><tbody>${rows}</tbody></table><p>Total: ${products.length}</p>`;
  printDocument(content, 'Product List');
};

export const printCustomerList = (customers, moduleName = 'POS System') => {
  const combinedName = getCombinedName(moduleName);
  const rows = customers.map(c => `<tr><td>${c.firstName} ${c.lastName}</td><td>${c.email||'-'}</td><td>${c.phone||'-'}</td><td class="text-right">${formatCurrency(c.totalSpent||0)}</td></tr>`).join('');
  const content = `<div class="header"><h1>CUSTOMER LIST</h1><div class="company">${combinedName}</div></div><table><thead><tr><th>Name</th><th>Email</th><th>Phone</th><th>Total Spent</th></tr></thead><tbody>${rows}</tbody></table><p>Total: ${customers.length}</p>`;
  printDocument(content, 'Customer List');
};

// ==================== ALIASES ====================
export const generateEmployeePrint = printEmployeeDetails;
export const generatePayslip = printPayslip;
export const generateAttendanceReport = printAttendanceReport;
export const generateLeaveNote = printLeaveNote;
export const generatePerformanceReport = printPerformanceReport;
export const generateTransactionReport = printTransactionList;
export const generateExpenseReport = printExpenseList;
export const generateIncomeReport = printIncomeList;
export const generateFinancialReport = printFinancialReport;
export const generateBudgetReport = printBudgetReport;
export const generateReceipt = printReceipt;
export const generateInvoice = printInvoice;
export const generateWithdrawalReceipt = printWithdrawalReceipt;
export const generateAccountStatement = printAccountStatement;

export default {
  printEmployeeDetails, printEmployeeList, printPayslip, printAttendanceReport, printLeaveNote,
  printPerformanceReport, printTransactionReceipt, printTransactionList, printExpenseList,
  printIncomeList, printFinancialReport, printBudgetReport, printInvoice, printWithdrawalReceipt,
  printAccountStatement, printReceipt, printProductList, printCustomerList
};