-- Insert four categories into the category table
INSERT INTO category (name)
VALUES
    ('Rent'),
    ('Utilities'),
    ('Transportation'),
    ('Groceries'),
    ('Dining'),
    ('Entertainment'),
    ('Misc');

-- Insert seven budget categories into the budget table
INSERT INTO budget (budget_limit, category_id)
VALUES
    (1500, 1),
    (100, 2),
    (50, 3),
    (350, 4),
    (500, 5),
    (65, 6),
    (100, 7);

-- Insert two expenses into the expense table
INSERT INTO expense (amount, description, category_id, expense_date)
VALUES  
    (1500, 'August Rent', 1, '2025-08-01'),
    (45, 'Gas', 3, '2025-08-15');
