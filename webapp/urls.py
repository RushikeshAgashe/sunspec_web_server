from django.conf.urls import url
from . import views

urlpatterns = [
	url(r'^$'			,views.index			,name='index'),
	url(r'^sunspecdata$'		,views.sunspecdata		,name='table'),
	url(r'^ang-table.js/$'		,views.ang_table		,name='ang_table'),
	url(r'^ang-chart.js/$'		,views.ang_chart		,name='ang_chart'),
	url(r'^timestampStart/$'	,views.timestamp_start		,name='timestamp_start'),
	url(r'^btnDatalogStart/$'	,views.btn_datalog_start	,name='start_datalog'),
	url(r'^btnDatalogStop/$'	,views.btn_datalog_stop		,name='stop_datalog'),
	url(r'^btnDatalogDownload/$'	,views.btn_datalog_download	,name='download_datalog'),
	url(r'^btnSubmit/$'		,views.btn_submit		,name='submit_button'),
	url(r'^btnGraphMultiple/$'	,views.btn_graph_multiple	,name='generate_graph_button'),
	url(r'^chart.html/(?P<datapoints>[\w-]+)/$'		,views.load_chart		,name='load_chart'),
	url(r'^chart.html/(?P<datapoints>[\w-]+)/chartdata/$'	,views.get_chart_data		,name='get_chart_data'),

]
