// Import inquirer and mysql modules
import mysql, { format } from 'mysql2';
import inquirer from 'inquirer';

// Connect to database
const db = mysql.createConnection(
    {
        host: 'localhost',
        // MySQL username
        user: 'root',
        // MySQL password
        password: 'Goingtotown234',
        database: 'finances_db'
    },
    console.log('Connected to the finances database.')
);

// Initial question that is asked on startup (called at the bottom of this file)
const initialQuestion = [
    {
        type: 'list',
        message: 'Welcome to Personal Pocketbook! Your money, simplified. What would you like to do?',
        name: 'actions',
        choices: ['Add Expense', 'View Expenses', 'View Budget', 'Exit Application'],
    },
];

// Take the user input from the initial question and feed it into a large decision tree
async function queryType(answers) {
    const choice = answers.actions;

    // Case statement based off initial user choice
    switch (choice) {
        // Case 1: Add Expense
        case 'Add Expense':
            // Call async addExpense function, which is declared below
            await addExpense();
            break;
        // Case 2: View Expenses
        case 'View Expenses':
            await viewExpenses();
            break;
        // Case 3: View Budget
        case 'View Budget':
            // Query budget table for all values, join to category table to pull in category name
            db.query('SELECT c.name, b.budget_limit, b.balance FROM budget AS b JOIN category AS c ON b.category_id = c.id', function (err, results) {
                const formattedResults = results.map((budget, index) => ({
                'Budget': `$${budget.budget_limit}`,
                'Balance': budget.balance < 0 ? `-$${Math.abs(budget.balance)}` : `$${budget.balance}`,
                'Category': budget.name,
                }));
                const monthName = new Date().toLocaleDateString('en-US', { month: 'long' });
                const yearName = new Date().toLocaleDateString('en-US', { year: 'numeric' });
                console.log(`Budget for ${monthName} ${yearName}:`);
                console.table(formattedResults);
                init();
            });
            break;
        // Case 4: Exit Application
        default: 
            console.log('Thank you for using Personal Pocketbook! Goodbye!')
            process.exit();
    } 
};

// Create a startup function to prompt user selection and execute choice
async function init() {
    try {
        const answers = await inquirer.prompt(initialQuestion);
        await queryType(answers);
    } catch (error) {
        console.log('Error:', error);
    }
}

// Create a function to view all expenses
async function viewExpenses() {
    try {
        // Query role table for all values, join to category table to pull in category name
        db.query('SELECT e.amount, e.description, c.name, e.transaction_date, e.entry_date FROM expense AS e JOIN category AS c ON e.category_id = c.id', function (err, results) {
            // Run results through a formatting function 
            const formattedResults = results.map((expense, index) => ({
                'Amount': `$${expense.amount}`,
                'Description': expense.description,
                'Category': expense.name,
                // Format the transaction date as a 'MMM-YY' string
                'Transaction Date': new Date(expense.transaction_date).toLocaleDateString('en-US', {
                    month: '2-digit',
                    day: '2-digit',
                    year: 'numeric'
                }),
                // Format the default timestring as a 'MM/DD/YYYY' string
                'Entry Date': new Date(expense.entry_date).toLocaleDateString('en-US', {
                    month: '2-digit',
                    day: '2-digit',
                    year: 'numeric'
                })
            }));
            // Return the formatted table
            console.table(formattedResults);
            init();
            });
    // Handle database and user input errors, then return to main menu
    } catch (error) {
        console.log('Error:', error);
        init();
    }
}

// Create a function to add an expense after obtaining user input
async function addExpense() {
    try {
        // Compile array of categories to include in prompt
        db.query('SELECT id, name FROM category', async (err, rows) => {

            // Add error catch for category compilation component
            if (err) {
                console.log('Error fetching categories:', err);
                init();
                return;
            }

            // Map these category names to an array called 'catArray'
            const catArray = rows.map(row => row.name);

            // Declare a date check function to ensure transaction_date is correct format
            const validateDate = (input) => {
            // Check if it matches YYYY-MM-DD format exactly
            const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
            if (!dateRegex.test(input)) {
                return 'Please enter date in YYYY-MM-DD format (e.g., 2025-08-27)';
            }
            
            // Breakout string into year, month and day components
            const date = new Date(input + 'T00:00:00'); // Add time to avoid timezone issues
            const parts = input.split('-');
            const year = parseInt(parts[0]);
            const month = parseInt(parts[1]);
            const day = parseInt(parts[2]);
            
            // Verify that date is not in the future
            if (date > new Date()) {
                return "Date cannot be in the future";
            }

            // Verify the date components match (catches invalid dates like Feb 30)
            if (date.getFullYear() !== year || 
                date.getMonth() + 1 !== month || 
                date.getDate() !== day) {
                return 'Please enter a valid date';
            }
            
            return true;
            };

            // Prompt user for expense details: amount, description, and category ID
            const expenseAnswers = await inquirer.prompt([
            {
                type: 'input',
                message: 'Enter expense amount:',
                name: 'amount'                
            },
            {
                type: 'list',
                message: 'Select category:',
                name: 'category_name' ,
                choices: catArray       
            },
            {
                type: 'input',
                message: 'Enter description:',
                name: 'description'
            },
            {
                type: 'input',
                message: 'Enter expense date (YYYY-MM-DD) or press Enter for today:',
                name: 'transactionDate',
                default: new Date().toISOString().split('T')[0], // Today's date
                validate: validateDate
            }
            ]);

            // Find the actual category ID to be passed into expense table
            const selectedCategory = catArray.indexOf(expenseAnswers.category_name)+1;

            // Insert the user input into the expense table
            db.query('INSERT INTO expense (amount, description, category_id, transaction_date, entry_date) VALUES (?, ?, ?, ?, ?)', [expenseAnswers.amount, expenseAnswers.description, selectedCategory, expenseAnswers.transactionDate, new Date()], (err, results) => {
                if (err) {
                    console.log('Error inserting expense:', err)
                    init();
                } else {
                    console.log('Expense added successfully!');
                    // Update the budget balance
                    db.query('UPDATE budget SET balance = balance - ? WHERE category_id = ?', [expenseAnswers.amount, selectedCategory], (updateErr, updateResults) => {
                        if (updateErr) {
                            console.log('Error updating category balance:', updateErr);
                        } else {
                             // Query to get the updated balance
                            db.query('SELECT b.balance, c.name FROM budget b JOIN category c ON b.category_id = c.id WHERE b.category_id = ?', [selectedCategory], (selectErr, selectResults) => {
                                if (selectErr) {
                                    console.log('Error fetching updated balance:', selectErr);
                                } else {
                                    const categoryName = selectResults[0].name;
                                    // If balance is <$0, format the result as '-$XXX'
                                    const formattedBalance = selectResults[0].balance < 0 ? `-$${Math.abs(selectResults[0].balance)}` : `$${selectResults[0].balance}`;
                                    if (selectResults[0].balance < 0) {
                                        console.log(`WARNING! You've overspent your budget for ${categoryName}! Current balance: ${formattedBalance}`);
                                    } else {
                                        console.log(`Balance for ${categoryName} now ${formattedBalance}`);
                                    }
                                }
                                init();
                            });
                        }
                    });
            }
        });
    })
    } catch (error) {
        console.log('Error:', error);
        init();
    } 
}

// Start the init function at application startup
init();