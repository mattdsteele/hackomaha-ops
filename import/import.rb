require "rubygems"
require "mysql2"
require "sequel"
require "pry"
require "csv"

DB = Sequel.connect adapter: :mysql2, username: "root", database: "oops"
YEARS = %w(20022003 20032004 20042005 20052006 20062007 20072008 20082009
  20092010 20102011 20112012 20122013)
