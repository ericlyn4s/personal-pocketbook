// Import inquirer and mysql modules
import mysql from 'mysql2';
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
            // Query role table for all values, join to category table to pull in category name
            db.query('SELECT e.amount, e.description, c.name, e.expense_date FROM expense AS e JOIN category AS c ON e.category_id = c.id', function (err, results) {
                const formattedResults = results.map((expense, index) => ({
                    Amount: `$${expense.amount}`,
                    Description: expense.description,
                    Category: expense.name,
                    Date: new Date(expense.expense_date).toLocaleDateString('en-US', {
                        month: '2-digit',
                        day: '2-digit',
                        year: 'numeric'
                    })
                }));
                console.log('Formatted results:');
                console.table(formattedResults);
                init();
            });
            break;
        // Case 3: View Budget
        case 'View Budget':
            // Query budget table for all values, join to category table to pull in category name
            db.query('SELECT c.name, b.budget_limit FROM budget AS b JOIN category AS c ON b.category_id = c.id', function (err, results) {
                console.table(results);
                init();
            })
            break;
        // Case 4: Exit Application
        default: 
            console.log('Thank you for using Personal Pocketbook! Goodbye!')
            process.exit();
    } 
};

// Create a function to prompt user selection and execute choice
async function init() {
    try {
        const answers = await inquirer.prompt(initialQuestion);
        await queryType(answers);
    } catch (error) {
        console.log('Error:', error);
    }
}

// Create a function to add an expense after obtaining user input
async function addExpense() {
    try {
        const expenseAnswers = await inquirer.prompt([
            {
                type: 'input',
                name: 'amount',
                message: 'Enter expense amount:'
            },
            {
                type: 'input',
                name: 'description',
                message: 'Enter description:'
            },
            {
                type: 'input',
                name: 'category',
                message: 'Enter category ID:'
            },
        ]);

        db.query('INSERT INTO expense (amount, description, category_id, expense_date) VALUES (?, ?, ?, ?)', [expenseAnswers.amount, expenseAnswers.description, expenseAnswers.category_id, new Date()], (err, results) => {
            if (err) console.log('Error inserting expense:', err);
            else console.log('Expense added successfully!');
            db.query('SELECT * FROM expense', (err, results) => {
    console.log('All expenses:', results);
});
            init(); // Go back to main menu
        });
        
    } catch (error) {
        console.log('Error:', error);
        init();
    }
}

// Start the init function at application startup
init();