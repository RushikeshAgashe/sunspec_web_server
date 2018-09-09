# Create your views here.
# -*- coding: utf-8 -*-
from django.shortcuts import render
from django.http import HttpResponse
import sqlite3
import os
import json
from collections import OrderedDict
import subprocess
import sys
sys.path.insert(0,'/home/debian/SunSpec-MODBUS-Communication-Suite/data_logging_app')
import sunspec_client_tcp as sunspec_client
import datetime

def read_from_db(filter = None):
	conn = sqlite3.connect(db_path+device_name+db_timestamp+'.db')
	c= conn.cursor()
	res = c.execute('select name from sqlite_master where type=\'table\'')
	tables = [table[0].encode('ascii') for table in res]
	db_dict = OrderedDict()
	db_json = []
	for table in tables:
		res = c.execute("SELECT DISTINCT id FROM " + table)
		data = c.fetchall()
		if filter:
			points = [point[0].encode('ascii') for point in data if point[0] in filter]
		else:
			points = [point[0].encode('ascii') for point in data]
		for id in points:
			res = c.execute("SELECT * FROM "+ table +" WHERE id='"+id+"'")
			data = c.fetchall()
			db_dict['timestamp']= data[-1][0]
			db_dict['id']= id
			db_dict['value']= data[-1][2]
			db_dict['sf']	= data[-1][3]
			db_dict['units']= data[-1][4]
			db_dict['type'] = data[-1][5]
			db_dict['access'] = data[-1][6]
			if db_dict['type'] not in ['sunssf', u'pad']:
				db_json.append(json.dumps(db_dict))
	c.close()
	conn.close()
	return db_json


def index(request):
	return render(request, 'web_ui/home.html')

def timestamp_start(request):
	return HttpResponse("Hello")

def sunspecdata(request):
	try:
		db_json = "[" + (",").join(read_from_db()) + "]"
		return HttpResponse(db_json, content_type="application/json")
	except NameError:
		return HttpResponse(status=503)

def ang_table(request):
	return render(request, 'web_ui/ang-table.js')

def ang_chart(request):
	return render(request, 'web_ui/ang-chart.js')

def get_server_name(request):
	global device_name
	try:
		device_name = os.environ["DEVICE_NAME"]+'_'
	except KeyError:
		pass
	return HttpResponse(device_name)
	
def btn_datalog_start(request):
	global db_timestamp
	db_timestamp =  datetime.datetime.now().strftime("%Y_%m_%d_%H_%M_%S")
	print "Running Sunpec Client"
	print db_timestamp
	try:
		#sunspec_client.run(timestamp=db_timestamp,port='/dev/ttyO1')
		sunspec_client.run(timestamp=db_timestamp,server_port=8899, server_address='10.76.56.2')
		return HttpResponse("Sunspec Client Stopped.")
	except IOError as e:
		print e
		btn_datalog_stop(request)
		return HttpResponse("Sunspec Client Failed - Error Reading from device.\nNo device present or communication not configured correctly.")

def btn_datalog_stop(request):
	sunspec_client.stop()
	return HttpResponse("Sunspec Client Stopped")

def btn_datalog_download(request):
	return HttpResponse("Hello")

def btn_submit(request):
	print request.body
	try:
		sunspec_client.add_to_write_queue(json.loads(request.body))
		response = 0
	except ValueError:
		response = -1
	return HttpResponse(response)

def btn_graph_multiple(request):
	return HttpResponse("Hello")
	
def get_chart_data(request,datapoints):
	datapoints = datapoints[:-1].split("-")
	db_json = "[" + (",").join(read_from_db(filter=datapoints)) + "]"
	return HttpResponse(db_json, content_type="application/json")

def load_chart(request,datapoints):
	datapoints = datapoints[:-1].split("-")
	print datapoints
	return render(request,'web_ui/chart.html')

device_name = 'BBBK_unknown_'
db_path = '../sunspec_database/'
