#!/usr/bin/python

import json 

f = open('pop2018.tsv', 'r')
lookup = {}
for line in f.readlines():
  tokens = line.strip().split("\t")
  if len(tokens) > 4:
    name = tokens[1].strip()
    try:
      urban = int(tokens[2].replace(' ', ''))
      rural = int(tokens[3].replace(' ', ''))
      total = int(tokens[4].replace(' ', ''))
      iso3 = tokens[5].strip()
      # print(iso3, total, name)
      lookup[iso3] = [total, urban, rural, name]
    except ValueError:
      print("Error: ", line.strip())



f = open('value_labels.json', 'r')
jj = json.loads(f.read())
seq = jj['country']
labels = jj['countries']
backup_lookup = {}
for item in labels:
  iso3 = item['iso3']
  name = item['name']
  if len(iso3) > 0:
    backup_lookup[iso3] = name

countries_in_order = []
for code in seq:
  name = ''
  total = -1
  urban = -1
  rural = -1
  if code in lookup:
    item = lookup[code]
    name = item[3]
    total = item[0]
    urban = item[1]
    rural = item[2]
  elif code in backup_lookup:
    name = backup_lookup[code]
  countries_in_order.append({
    "name" : name,
    "total" : total,
    "urban" : urban,
    "rural" : rural
  })

s = json.dumps(countries_in_order)
f = open('population_2018.json', 'w')
f.write(s)
f.close()