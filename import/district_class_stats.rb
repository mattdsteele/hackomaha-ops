require_relative "import"

def load_district_class_stats years, row
  DB[:district_class_stats].insert({
    years: years,
    district_id: row[:district_id],
    grade: row[:grade],
    male_students: row[:males],
    female_students: row[:females],
    enrollment_size: row[:total]
  })
end

YEARS.each do |years|
  query = <<-SQL
    select
      district_id,
      grade,
      sum(male_students) as males,
      sum(female_students) as females,
      sum(enrollment_size) as total
    from class_stats
    where years='#{years}'
    group by district_id, grade
  SQL

  DB[query].each do |row|
    load_district_class_stats years, row
  end
end
