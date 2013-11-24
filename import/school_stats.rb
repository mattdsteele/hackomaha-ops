require_relative "import"

def load_school_stats years, row
  DB[:school_stats].insert({
    years: years,
    school_id: row[:school_id],
    district_id: row[:school_id][0..5],
    male_students: row[:males],
    female_students: row[:females],
    enrollment_size: row[:total]
  })
end

YEARS.each do |years|
  query = <<-SQL
    select
      school_id,
      sum(male_students) as males,
      sum(female_students) as females,
      sum(enrollment_size) as total
    from class_stats
    where years='#{years}'
    group by school_id
  SQL

  DB[query].each do |row|
    load_school_stats years, row
  end
end
