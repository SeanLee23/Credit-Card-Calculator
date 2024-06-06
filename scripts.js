let cardCount = 0;

function addCard() {
    const cardDiv = document.createElement('div');
    cardDiv.classList.add('card');
    cardDiv.innerHTML = `
        <label>Debt: <input type="number" step="0.01" id="debt${cardCount}" placeholder="Debt" required></label>
        <label>Interest Rate: <input type="number" step="0.01" id="rate${cardCount}" placeholder="Interest Rate (%)" required></label>
        <label>Monthly Payment: <input type="number" step="0.01" id="payment${cardCount}" placeholder="Monthly Payment" required></label>
    `;
    document.getElementById('cards').appendChild(cardDiv);
    cardCount++;
}

function calculatePayoff() {
    const resultsDiv = document.getElementById('results');
    resultsDiv.innerHTML = '';

    let cardsInfo = [];
    for (let i = 0; i < cardCount; i++) {
        const debt = parseFloat(document.getElementById(`debt${i}`).value);
        const rate = parseFloat(document.getElementById(`rate${i}`).value) / 100;
        const payment = parseFloat(document.getElementById(`payment${i}`).value);

        if (isNaN(debt) || isNaN(rate) || isNaN(payment) || debt <= 0 || rate <= 0 || payment <= 0) {
            alert('Please fill in all fields with valid numbers greater than zero.');
            return;
        }

        cardsInfo.push({ debt, rate, payment });
    }

    const hourlyWage = parseFloat(document.getElementById('hourlyWage').value);
    const hoursPerWeek = parseFloat(document.getElementById('hoursPerWeek').value);
    const annualSalary = parseFloat(document.getElementById('annualSalary').value);

    if (isNaN(hourlyWage) && isNaN(annualSalary)) {
        alert('Please fill in either hourly wage or annual salary.');
        return;
    }

    if ((hourlyWage > 0 && hoursPerWeek <= 0) || (hourlyWage <= 0 && hoursPerWeek > 0)) {
        alert('Please provide both hourly wage and hours per week.');
        return;
    }

    const monthlyIncome = calculateMonthlyIncome(hourlyWage, hoursPerWeek, annualSalary);

    const results = [];
    for (const card of cardsInfo) {
        const months = calculatePayoffTime(card.debt, card.rate, card.payment);
        results.push({ ...card, months });
    }

    displayResults(results, monthlyIncome);
    displaySuggestions(results, monthlyIncome);
}

function calculateMonthlyIncome(hourlyWage, hoursPerWeek, annualSalary) {
    let monthlyIncome = 0;
    if (hourlyWage > 0 && hoursPerWeek > 0) {
        monthlyIncome += hourlyWage * hoursPerWeek * 4.33;
    }
    if (annualSalary > 0) {
        monthlyIncome += annualSalary / 12;
    }
    return monthlyIncome;
}

function calculatePayoffTime(debt, rate, monthlyPayment) {
    if (monthlyPayment <= (debt * rate / 12)) {
        return Infinity;
    }
    const nMonths = Math.log(monthlyPayment / (monthlyPayment - debt * rate / 12)) / Math.log(1 + rate / 12);
    return Math.ceil(nMonths);
}

function displayResults(results, monthlyIncome) {
    const resultsDiv = document.getElementById('results');
    resultsDiv.innerHTML += '<h2>Results</h2>';
    resultsDiv.innerHTML += '<ul>';
    results.forEach((result, index) => {
        resultsDiv.innerHTML += `<li>Card ${index + 1}: Debt = $${result.debt.toFixed(2)}, Interest Rate = ${(result.rate * 100).toFixed(2)}%, Monthly Payment = $${result.payment.toFixed(2)}, Months to Payoff = ${result.months === Infinity ? 'Never (increase payment)' : result.months}</li>`;
    });
    resultsDiv.innerHTML += '</ul>';
}

function displaySuggestions(results, monthlyIncome) {
    const resultsDiv = document.getElementById('results');
    
    const optimalMonthlyPayment = (monthlyIncome * 0.15).toFixed(2);

    resultsDiv.innerHTML += `<h2>Suggestions</h2>`;
    resultsDiv.innerHTML += `<p>Based on your income, we suggest you allocate $${optimalMonthlyPayment} per month towards debt repayment.</p>`;

    const avalanche = [...results].sort((a, b) => b.rate - a.rate); 
    resultsDiv.innerHTML += '<h2>Avalanche Method (Highest Interest Rate First)</h2>';
    resultsDiv.innerHTML += '<ul>';
    avalanche.forEach((result, index) => {
        resultsDiv.innerHTML += `<li>Card ${index + 1}: Debt = $${result.debt.toFixed(2)}, Interest Rate = ${(result.rate * 100).toFixed(2)}%, Monthly Payment = $${result.payment.toFixed(2)}, Months to Payoff = ${result.months === Infinity ? 'Never (increase payment)' : result.months}</li>`;
    });
    resultsDiv.innerHTML += '</ul>';
    
    const snowball = [...results].sort((a, b) => a.debt - b.debt); 
    resultsDiv.innerHTML += '<h2>Snowball Method (Smallest Balance First)</h2>';
    resultsDiv.innerHTML += '<ul>';
    snowball.forEach((result, index) => {
        resultsDiv.innerHTML += `<li>Card ${index + 1}: Debt = $${result.debt.toFixed(2)}, Interest Rate = ${(result.rate * 100).toFixed(2)}%, Monthly Payment = $${result.payment.toFixed(2)}, Months to Payoff = ${result.months === Infinity ? 'Never (increase payment)' : result.months}</li>`;
    });
    resultsDiv.innerHTML += '</ul>';
}