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

-- noc_categories: from level 5 unit groups, linked to industry + subcategory
INSERT INTO noc_categories (noc21_code, noc21_name, industry_id, subcategory_id)
SELECT
    LPAD(ug.code, 5, '0'),
    ug.class_title,
    i.id,
    s.id
FROM noc_classification ug
JOIN noc_classification bc
    ON bc.level = '1'
   AND bc.code = LEFT(LPAD(ug.code, 5, '0'), 1)
JOIN industries i ON i.name = bc.class_title
JOIN noc_classification mg
    ON mg.level = '4'
   AND LPAD(mg.code, 4, '0') = LEFT(LPAD(ug.code, 5, '0'), 4)
JOIN subcategories s ON s.name = mg.class_title AND s.industry_id = i.id
WHERE ug.level = '5'
ON CONFLICT (noc21_code) DO UPDATE
    SET noc21_name = EXCLUDED.noc21_name,
        industry_id = EXCLUDED.industry_id,
        subcategory_id = EXCLUDED.subcategory_id;