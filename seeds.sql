INSERT INTO department (name)
VALUES ("Engineering"),
       ("Finance"),
       ("Legal"),
       ("Sales");

INSERT INTO roles (title, department_id, salary)
VALUES ("Lead Engineer", 1, 150000),
       ("Software Engineer", 1, 120000),
       ("Account Manager", 2, 160000),
       ("Accountant", 2, 125000),
       ("Legal Team Lead", 3, 250000),
       ("Lawyer", 3, 190000),
       ("Sales Lead", 4, 100000),
       ("Salesperson", 4, 80000);

INSERT INTO employee (first_name, last_name, roles_id, manager_id)
VALUES ("Ashley", "Rodriguez", 1, null),
       ("Kevin", "Tupik", 2, 1),
       ("Kunal", "Signh", 3, null),
       ("Malia", "Brown", 4, 3),
       ("Sarah", "Lourd", 5, null),
       ("Tom", "Allen", 6, 5),
       ("John", "Doe", 7, null),
       ("Mike", "Chan", 8, 7);



