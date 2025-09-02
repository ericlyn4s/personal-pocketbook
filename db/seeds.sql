-- Insert four categories into the category table
INSERT INTO category (name)
VALUES
    ('Dining'),
    ('Groceries'),
    ('Entertainment'),
    ('Transportation'),
    ('Rent'),
    ('Utilities'),    
    ('Misc');

-- Insert seven budget categories into the budget table
INSERT INTO budget (budget_limit, balance, category_id)
VALUES
    (200, 200, 1),
    (200, 200, 2),
    (100, 100, 3),
    (100, 100, 4),
    (1500, 1500, 5),
    (65, 65, 6),
    (100, 100, 7);

-- Insert two expenses into the expense table
INSERT INTO expense (amount, description, category_id, transaction_date, entry_date)
VALUES  
    (1500, 'August Rent', 1, NOW(), '2025-08-01'),
    (45, 'Gas', 3, NOW(), '2025-08-15');
