require_relative "import"

years = %w(20052006 20062007 20072008 20082009 20092010 20102011 20112012 20122013)
files = years.map { |y| "../raw-data/Teacher#{y}.csv" }

files.each do |file|
  rows = CSV.new File.read(file), col_sep: "\t", headers: true

  rows.each do |row|
    year = row["School Year"]
    school_id = row["County"] + row["District"] + row["School"]

    DB[:school_stats]
      .where(school_id: school_id, years: year)
      .update({
        teacher_size: row["Teacher Count"].to_i,
        teacher_salary: row["Average Teacher Salary"],
        teacher_masters_size: row["Masters Count"].to_i,
        teacher_experience: row["Average Years of Teaching Experience"]
      })
  end
end
