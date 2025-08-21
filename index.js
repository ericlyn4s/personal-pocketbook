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
        message: 'What would you like to do?',
        name: 'actions',
        choices: ['Option 1', 'Option 2', 'Option 3'],
    },
];

// Take the user input from the initial question and feed it into a large decision tree
function queryType(answers) {
    const choice = answers.actions;

    // Case statement based off initial user choice
    switch (choice) {
        case 'Option 1':
            console.log('Wow');
            break;
        case 'Option 2':
            console.log('You would');
            break;
        case 'Option 2':
            console.log('Ok wow');
            break;
    }; 

}

// Create a function to prompt user selection and execute choice
async function init() {
    try {
        const answers = await inquirer.prompt(initialQuestion);
        data => queryType(answers);
    } catch (error) {
        console.log('Error:', error);
    }
}

// Start the init function at application startup
init();