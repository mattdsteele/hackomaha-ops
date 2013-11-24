require_relative "import"

def load_district_stats years, row
  DB[:district_stats].insert({
    years: years,
    district_id: row[:district_id],
    male_students: row[:males],
    female_students: row[:females],
    enrollment_size: row[:total],
    teacher_size: row[:teacher_size],
    teacher_salary: row[:teacher_salary],
    teacher_masters_size: row[:teacher_masters_size],
    teacher_experience: row[:teacher_experience]
  })
end

YEARS.each do |years|
  query = <<-SQL
    select
      district_id,
      sum(male_students) as males,
      sum(female_students) as females,
      sum(enrollment_size) as total,
      sum(teacher_size) as teacher_size,
      round(avg(teacher_salary), 2) as teacher_salary,
      sum(teacher_masters_size) as teacher_masters_size,
      round(avg(teacher_experience), 2) as teacher_experience
    from school_stats
    where years='#{years}'
    group by district_id
  SQL

  DB[query].each do |row|
    load_district_stats years, row
  end
end
