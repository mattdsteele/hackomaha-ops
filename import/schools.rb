require_relative "import"

class RowPresenter < Struct.new :row
  def address
    row[:address].split(",")[1..-1].join(",").strip rescue nil
  end

  def county_id; row[:county]; end
  def district_id; school_id[0..5]; end
  def district_name; row[:district_name]; end
  def grade; row[:grade]; end
  def lat; row[:lat]; end
  def lon; row[:lon]; end
  def school_id; row[:school_code].to_s; end
  def school_name; row[:school_name]; end
  def students_female; row[:female_total]; end
  def students_male; row[:male_total]; end
  def students_total; row[:total]; end
  def years; row[:years]; end
end

def load_district row
  DB[:districts].insert({
    id: row.district_id,
    county_id: row.county_id,
    name: row.district_name
  })
rescue Sequel::DatabaseError
end

def load_school row
  DB[:schools].insert({
    id: row.school_id,
    district_id: row.district_id,
    county_id: row.county_id,
    name: row.school_name,
    address: row.address,
    lat: row.lat,
    lon: row.lon
  })
rescue Sequel::DatabaseError
end

def load_stats row
  DB[:class_stats].insert({
    school_id: row.school_id,
    district_id: row.school_id,
    years: row.years,
    grade: row.grade,
    female_students: row.students_female,
    male_students: row.students_male,
    enrollment_size: row.students_total
  })
end

rows = DB["select * from raw"]

rows.each { |row| load_district RowPresenter.new(row) }
rows.each { |row| load_school RowPresenter.new(row) }
rows.each { |row| load_stats RowPresenter.new(row) }
