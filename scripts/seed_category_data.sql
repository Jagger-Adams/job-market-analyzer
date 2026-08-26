-- Industries: from level 1 broad categories
INSERT INTO industries (name)
SELECT class_title
FROM noc_classification
WHERE level = '1'
ON CONFLICT (name) DO NOTHING;

-- Subcategories: from level 4 minor groups, linked to their broad-category industry
INSERT INTO subcategories (name, industry_id)
SELECT mg.class_title, i.id
FROM noc_classification mg
JOIN noc_classification bc
    ON bc.level = '1'
   AND bc.code = LEFT(LPAD(mg.code, 4, '0'), 1)
JOIN industries i ON i.name = bc.class_title
WHERE mg.level = '4'
ON CONFLICT (name, industry_id) DO NOTHING;
