require 'net/http'
require 'json'

`rm -rf data`
Dir.mkdir('data')
Dir.mkdir('data/district')
Dir.mkdir('data/school')

base_url = 'http://schools.opennebraska.io'

districts_uri = URI("#{base_url}/districts")
districts = Net::HTTP.get(districts_uri)

File.open('data/districts.json', 'w') do |f|
  f.write(districts)
end

JSON.parse(districts).each do |d|
  id = d["Id"]
  district = Net::HTTP.get(URI("#{base_url}/district/#{id}"))
  File.open("data/district/#{id}.json", 'w') do |f|
    f.write(district)
  end
end

schools_uri = URI("#{base_url}/schools")
schools = Net::HTTP.get(schools_uri)

File.open('data/schools.json', 'w') do |f|
  f.write(schools)
end

JSON.parse(schools).each do |d|
  id = d["Id"]
  school = Net::HTTP.get(URI("#{base_url}/school/#{id}"))
  File.open("data/school/#{id}.json", 'w') do |f|
    f.write(school)
  end
end
