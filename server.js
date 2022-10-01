const mysql = require('mysql2');
const inquirer = require('inquirer');
const cTable = require('console.table');

const db = mysql.createConnection(
    {
        host: 'localhost',
        port: 3306,
        // MySQL username
        user: 'root',
        // MySQL password
        password: '',
        database: 'employee_db'
    },
    console.log(`Connected to the employee_db database.`)
);

// The normal prompt that generates the questions for the user
const promptUser = () => {
    inquirer.prompt([
        {
            name: 'choices',
            type: 'list',
            message: 'Please select an option',
            choices: [
                'view all departments',
                'view all roles', 
                'view all employees', 
                'add a department', 
                'add a role', 
                'add an employee', 
                'update an employee role',
                'exit'
            ]
        }
    ])
    // Goes over the answer given from prompt and then sends to given function
    .then((answers) => {
        const {choices} = answers;

        if(choices === 'view all departments') {
            viewAllDepartments();
        }

        if(choices === 'view all roles') {
            viewAllRoles();
        }

        if(choices === 'view all employees') {
            viewAllEmployees();
        }

        if(choices === 'add a department') {
            addADepartment();
        }

        if(choices === 'add a role') {
            addARole();
        }

        if(choices === 'add an employee') {
            addAnEmployee();
        }

        if(choices === 'update an employee role') {
            updateAnEmployeeRole();
        }

        if(choices === 'exit') {
            db.end();
        }
    });
};

//Views all Departments
const viewAllDepartments = () => {
    console.log(``);
    db.query('SELECT * FROM department', function (err, results) {
        if (err) {
            console.log(err);
        } else {
            console.table(results);
            promptUser();
        }
    });
};

// Views all Role
const viewAllRoles = () => {
    console.log(``);
    db.query(
        `SELECT roles.id, roles.title, department.name AS department, roles.salary
        FROM department
        INNER JOIN roles
        ON roles.department_id = department.id`, 
        function (err, results) {
            if (err) {
                console.log(err);
            } else {
                console.table(results);
                promptUser();
            }
    });
};

// Views all Employees
const viewAllEmployees = () => {
    console.log(``);
    db.query(
        `SELECT e.id, e.first_name, e.last_name, roles.title AS title, department.name AS department, 
            roles.salary AS salary, CONCAT(m.first_name, ' ', m.last_name) AS manager
        FROM employee e
        JOIN roles ON e.roles_id = roles.id
        JOIN department ON roles.department_id = department.id
        LEFT JOIN employee m ON m.id = e.manager_id;`, 
        function (err, results) {
            if (err) {
                console.log(err);
            } else {
                console.table(results);
                promptUser();
            }
    });
};

// Adds department
const addADepartment = () => {
    inquirer.prompt([
        {
            name: 'addADepartment',
            type: 'input',
            message: 'What is the name of the department?'
        }
    ])
    .then((answer) => {
        db.query(
            `INSERT INTO department (name) VALUES (?)`,
            answer.addADepartment, (err, result) => {
                if (err) {
                    console.log(err);
                } else {
                    console.log(`Added ${answer.addADepartment} to the database`);
                    promptUser();
                }
        });
    });
};

// Add a new role
const addARole = () => {
    db.query('SELECT * FROM department', function (err, results) {
        if (err) {
            console.log(err);
        } else {
            // allows user to select any of the departments in the database
            let departmentNamesArray = [];
            results.forEach((department) => {
                departmentNamesArray.push(department.name);
            });

            inquirer.prompt([
                {
                    name: 'addARole',
                    type: 'input',
                    message: 'What is the name of the role?'
                },
                {
                    name: 'salary',
                    type: 'input',
                    message: 'What is the salary of the role?'
                },
                {
                    name: 'departmentChoice',
                    type: 'list',
                    message: 'Which department does this role belong to?',
                    choices: departmentNamesArray
                }
            ])
            .then((answers) => {
                let newRole = answers.addARole;
                let newSalary = answers.salary;
                let choice = answers.departmentChoice;
                let department_id;

                // checks if department chosen is the same as the department in the database and the connects its "id"
                results.forEach((department) => {
                    if (choice === department.name) {
                        department_id = department.id;
                    }
                });

                // Inserts in data to create new role
                let sql = 'INSERT INTO roles (title, salary, department_id) values (?, ?, ?)';
                let parameters = [newRole, newSalary, department_id]

                db.query(sql, parameters, (err, results) => {
                    if (err) {
                        console.log(err);
                    } else {
                        console.log(`Added ${newRole} to the database`);
                        promptUser();
                    }
                });
            });
        }
    });
}

// Adds a new Employee
const addAnEmployee = () => {
    db.query('SELECT * FROM roles', function (err, results) {
        if (err) {
            console.log(err);
        } else {
            // allows user to chose from any role in the Database
            let roleArray = [];
            results.forEach((roles) => {
                roleArray.push(roles.title);
            });

            // Questions for user to create a new employee
            inquirer.prompt([
                {
                    name: 'firstName',
                    type: 'input',
                    message: `What is the employee's first name?`
                },
                {
                    name: 'lastName',
                    type: 'input',
                    message: `What is the employee's last name?`
                },
                {
                    name: 'roleChoice',
                    type: 'list',
                    message: 'Which department does this role belong to?',
                    choices: roleArray
                }
            ])
            .then(answer =>  {
                let firstName = answer.firstName
                let lastName = answer.lastName
                let choice = answer.roleChoice;
                let roles_id;

                // Checks if choice is equal to a role in the roles table and then assigns id equal to variable
                results.forEach((roles) => {
                    if (choice === roles.title) {
                        roles_id = roles.id;
                    }
                });
                const parameters = [firstName, lastName, roles_id];
                db.query(`SELECT * FROM employee`, function (err, results) {
                    if (err) {
                        console.log(err);
                    } else {
                        // takes values results query (specifically id, first_name, last_name) and then map loops through each value and generates first_name last_name , id.
                        const managers = results.map(({ id, first_name, last_name }) => ({ name: first_name + " " + last_name, value: id }));
                        
                        managers.push('none');
                        inquirer.prompt([
                            {
                                type: 'list',
                                name: 'manager',
                                message: `Who is the employee's manager?`,
                                choices: managers
                            }
                        ])
                        .then(theManager => {
                            let newManager;
                            const manager = theManager.manager;
                            // allows user to select none and if selected will output in mysql as "null"
                            if (manager === 'none') {
                                newManager = null;
                            } else {
                                newManager = manager;
                            }

                            // inserts data into new employee
                            parameters.push(newManager);
                            const sql =   `INSERT INTO employee (first_name, last_name, roles_id, manager_id)
                                        VALUES (?, ?, ?, ?)`;
                            db.query(sql, parameters, (error) => {
                            if (error) throw error;
                            console.log(`Added ${firstName} ${lastName} to the database`)
                            promptUser();
                        });
                    });
                }});
            })
        };
    }
)};

// Updated an exisiting employee's role
const updateAnEmployeeRole = () => {
    let updateEmployeeSQL = `SELECT e.id, e.first_name, e.last_name, roles.title
        FROM employee e
        JOIN roles ON e.roles_id = roles.id
        JOIN department ON roles.department_id = department.id`;
    db.query(updateEmployeeSQL, function (err, response) {
        if (err) {
            console.log(err);
        } else {
            // allows user to select employees from the employee table
            let employeeArray = [];
            response.forEach((employee) => {
                employeeArray.push(`${employee.first_name} ${employee.last_name}`);
            });

            let seeRoles = `SELECT roles.id, roles.title FROM roles`;
            db.query(seeRoles, function (err, results) {
                if (err) {
                    console.log(err);
                } else {
                    // allows user to select roles from the roles table
                    let rolesArray = [];
                    results.forEach((roles) => {
                        rolesArray.push(roles.title);
                    });

                    inquirer.prompt([
                        {
                            name: 'selectEmployee',
                            type: 'list',
                            message: `Which employee's role do you want to update?`,
                            choices: employeeArray
                        },
                        {
                            name: 'selectNewRole',
                            type: 'list',
                            message: 'Which role do you want to assign the selected employee?',
                            choices: rolesArray
                        }
                    ])
                    .then((answers) => {
                        let selectEmployee = answers.selectEmployee;
                        let selectNewRole = answers.selectNewRole;
                        let employeeID;
                        let roleID;

                        // sets selected employee if equal to one in the table to that corresponding "id"
                        response.forEach((employee) => {
                            if (selectEmployee === `${employee.first_name} ${employee.last_name}`) {
                                employeeID = employee.id;
                            }
                        });

                        // sets selected role if equal to one in the table to that corresponding "id"
                        results.forEach((roles) => {
                            if (selectNewRole === roles.title) {
                                roleID = roles.id;
                            }
                        });

                        let parameters = [roleID];
                        parameters.push(employeeID);

                        // updated data into employee table
                        let updatedEmployeeSQL =
                            `UPDATE employee SET employee.roles_id = ? WHERE employee.id = ?`;
                        db.query(updatedEmployeeSQL, parameters, (error) => {
                            if (error) throw error;
                            console.log(`Updated employee's role`);
                            promptUser();
                        });
                    });
                }
            });
        }
    });
};

// Starts the projet
promptUser();
