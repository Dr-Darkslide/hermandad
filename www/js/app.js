var app = {};
app.webdb = {};
app.webdb.db = null;
var inputGlobal1,inputGlobal2;//para almacenar los input actuales 
var clientGlobal;
var userLoginGlobal;
var fechaSincronizacion;//variable donde se almacenara la ultima fecha la cual fue sincronizado
//para saber a que pagina irse o donde esta actualmente;
//1: datos del cliente
var paginaActual = 0;
//--------------------------------------------------------
function activarFiltrosDep(){
	$.mobile.document
    .on( "listviewcreate", "#cb_departamento-menu", function( e ) {
        var input,
            listbox = $( "#cb_departamento-listbox" ),
            form = listbox.jqmData( "filter-form" ),
            listview = $( e.target );
        if ( !form ) {
            input = $( "<input data-type='search'></input>" );
            form = $( "<form></form>" ).append( input );
            input.textinput();
            $( "#cb_departamento-listbox" )
                .prepend( form )
                .jqmData( "filter-form", form );
        }
        listview.filterable({ input: input });
    })
    .on( "pagebeforeshow pagehide", "#cb_departamento-dialog", function( e ) {
        var form = $( "#cb_deparamento-listbox" ).jqmData( "filter-form" ),
            placeInDialog = ( e.type === "pagebeforeshow" ),
            destination = placeInDialog ? $( e.target ).find( ".ui-content" ) : $( "#cb_deparamento-listbox" );
        form
            .find( "input" )
            .textinput( "option", "inset", !placeInDialog )
            .end()
            .prependTo( destination );
    });
}
//--------------------------------------------------------
//Funcion de arranque
//--------------------------------------------------------
app.initialize = function() {
	app.bindEvents();
	app.initFastClick();
};
app.bindEvents = function() {
    activarFiltrosDep();
    
    $.mobile.document
    .on( "listviewcreate", "#cb_municipio-menu", function( e ) {
        var input,
            listbox = $( "#cb_municipio-listbox" ),
            form = listbox.jqmData( "filter-form" ),
            listview = $( e.target );
        if ( !form ) {
            input = $( "<input data-type='search'></input>" );
            form = $( "<form></form>" ).append( input );
            input.textinput();
            $( "#cb_municipio-listbox" )
                .prepend( form )
                .jqmData( "filter-form", form );
        }
        listview.filterable({ input: input });
    })
    .on( "pagebeforeshow pagehide", "#cb_municipio-dialog", function( e ) {
        var form = $( "#cb_municipio-listbox" ).jqmData( "filter-form" ),
            placeInDialog = ( e.type === "pagebeforeshow" ),
            destination = placeInDialog ? $( e.target ).find( ".ui-content" ) : $( "#cb_municipio-listbox" );
        form
            .find( "input" )
            .textinput( "option", "inset", !placeInDialog )
            .end()
            .prependTo( destination );
    });    
    
    $.mobile.document
    .on( "listviewcreate", "#cb_aldea-menu", function( e ) {
        var input,
            listbox = $( "#cb_aldea-listbox" ),
            form = listbox.jqmData( "filter-form" ),
            listview = $( e.target );
        if ( !form ) {
            input = $( "<input data-type='search'></input>" );
            form = $( "<form></form>" ).append( input );
            input.textinput();
            $( "#cb_aldea-listbox" )
                .prepend( form )
                .jqmData( "filter-form", form );
        }
        listview.filterable({ input: input });
    })
    .on( "pagebeforeshow pagehide", "#cb_aldea-dialog", function( e ) {
        var form = $( "#cb_aldea-listbox" ).jqmData( "filter-form" ),
            placeInDialog = ( e.type === "pagebeforeshow" ),
            destination = placeInDialog ? $( e.target ).find( ".ui-content" ) : $( "#cb_aldea-listbox" );
        form
            .find( "input" )
            .textinput( "option", "inset", !placeInDialog )
            .end()
            .prependTo( destination );
    }); 
    
    $(document).bind("pageinit", function() {
		$.mobile.ajaxEnabled = false;
		$.support.cors = true;
		$.mobile.phonegapNavigationEnabled = false;
	    $.mobile.allowCrossDomainPages = false;
	    $.mobile.ajaxLinksEnabled = false;
	    $.mobile.defaultPageTransition = "none";
	    $.mobile.orientationChangeEnabled = false;
	    if(sinRepeticion == 0){
		    document.addEventListener('deviceready', app.onDeviceReady, false);//para probar en android
		    //app.onDeviceReady();//para probar en chrome
		    sinRepeticion = 1;
	    }
		 $(".format_number").autoNumeric("init");
	});
};
app.initFastClick = function() {
    window.addEventListener('load', function() {
        FastClick.attach(document.body);
    }, false);
};
app.onDeviceReady = function() {
	$.mobile.loading("show");
	//salir cuando se presione el boton atras en el cel
	document.addEventListener("backbutton", function(){
        navigator.notification.confirm(
        		'\xbfDesea salir de la aplicaci\xf3n?', // message
        		function(indexButton){// callback to invoke with index of button pressed
        			if(indexButton == 1){
        				navigator.app.exitApp();
        			}
        		},
                'Aviso',           // title
                ['Si','No']         // buttonLabels
            );
	}, false);
	//funciones cuando este en pause
	document.addEventListener("pause", function(){
		console.log('app entra en pause.');
	}, false);
	app.webdb.abrir();
	$.mobile.loading("show");
	app.webdb.crear_tablas();
	$.mobile.loading("hide");
	//$('.currencyFormat').formatCurrency();
	$(".format_number").autoNumeric('init');
};
//--------------------------------------------------------
//Abrir BD
//--------------------------------------------------------
app.webdb.abrir = function() {
	var dbSize = 25 * 1024 * 1024; // 25MB
	app.webdb.db = openDatabase("funMicroHerHonduras", "1.0", "Datos para Microfinaciera", dbSize);
};
//crear la tablas si existen
app.webdb.crear_tablas = function(){
	var db = app.webdb.db;
	crearTablas(db);//esta funcion  se encuentra el app_complemnto
};
//-------------------------------------
//MENSAJE DE ERROR
//-------------------------------------
app.webdb.onError = function(err){
	quitarLoad();
	alert('Error: '+err.code+" - "+err.message);
    /*navigator.notification.alert(
            'Error: '+err.code+" - "+err.message,  // message
            alertDismissed,         // callback
            'Alerta',          // title
            'Aceptar'        // buttonName
    );*/	
};

function cambiarPagina(idPagina){
	$.mobile.loading("show");
	cargarLabelPrincipal(idPagina);
	$.mobile.changePage($('#pag_'+idPagina));
	$.mobile.loading("hide");
}

function quitarLoad(){
	$.mobile.loading("hide");
}

function alertDismissed(){
    // do something
}
//-------------------------------------------
// funciones genericas
//-------------------------------------------
function obtenerCoordenadas(input1,input2){
	$.mobile.loading( "show", {
		  text: "Obteniendo Coordenadas",
		  textVisible: true,
		  theme: "a"
		});
	inputGlobal1 = input1;
	inputGlobal2 = input2;
	navigator.geolocation.getCurrentPosition(onSuccessCoordenadas, onErrorCoordenadas,{enableHighAccuracy: true});
}

//onSuccess Geolocation
function onSuccessCoordenadas(position){
	var lalitud=0,altitud=0;
	lalitud = position.coords.latitude;
	altitud = position.coords.longitude;
	$('#'+inputGlobal1).val(lalitud);
	$('#'+inputGlobal2).val(altitud);
	$.mobile.loading("hide");
}

// onError Callback receives a PositionError object
function onErrorCoordenadas(error) {
	$.mobile.loading("hide");
    alert('Fallo la obtencion de las coordenadas, favor revisar que el sensor GPS esta activo.');
}

function cambiarPorcentajeTipoBien(combo){
	var selectedOption = $(combo).find('option:selected');
	var porcentaje;
	selectedOption = eval(selectedOption.val()); 
	if(selectedOption == 1){
		porcentaje = 40;
	}else if(selectedOption == 2){
		porcentaje = 60;
	}else if(selectedOption == 3){
		porcentaje = 40;
	}else{
		porcentaje = 50;
	}
	$('#hd_pren_mapPorcentTipoBien').val(porcentaje);
	$('#txt_pren_maqGarantia').val(porcentaje+"%");
	$('#txt_pren_maqMontoCobertura').val(($('#txt_pren_maqValor').val()*($('#hd_pren_mapPorcentTipoBien').val()/100)).toFixed(2))
}

function calcularFactMap(valor1,valor2,sutTotal){
	var total = 0;
	if(valor1.length == 0 || valor2.length == 0){
		$(sutTotal).val(0);
	}else{
		$(sutTotal).val((eval(valor1)*eval(valor2)).toFixed(2));
	}
	
	total += eval($('#txt_pren_maqValorTotal1').val().length==0?0:$('#txt_pren_maqValorTotal1').val());
	total += eval($('#txt_pren_maqValorTotal2').val().length==0?0:$('#txt_pren_maqValorTotal2').val());
	total += eval($('#txt_pren_maqValorTotal3').val().length==0?0:$('#txt_pren_maqValorTotal3').val());
	total += eval($('#txt_pren_maqValorTotal4').val().length==0?0:$('#txt_pren_maqValorTotal4').val());
	total += eval($('#txt_pren_maqValorTotal5').val().length==0?0:$('#txt_pren_maqValorTotal5').val());
	
	$('#txt_pren_maqValorGranTotal').val(total.toFixed(2));
}

function cambioEstadoPrendario(camboPrendario){
	var selectedOption = $(camboPrendario).find('option:selected');
	if(eval(selectedOption.val()) == 1){
		$('#div_pren_ven').show();
		$('#div_pren_maq').hide();
		$('#div_pren_Ahorro').hide();
		$('#div_pren_maqCapturas').show();
	}else if(eval(selectedOption.val()) == 2){
		$('#div_pren_ven').hide();
		$('#div_pren_maq').show();
		$('#div_pren_Ahorro').hide();
		$('#div_pren_maqCapturas').show();
	}else if(eval(selectedOption.val()) == 3){
		$('#div_pren_ven').hide();
		$('#div_pren_maq').hide();
		$('#div_pren_Ahorro').show();
		$('#div_pren_maqCapturas').hide();		
	}
}

function cambioEstado(camboEstado,tabla){
	var selectedOption = $(camboEstado).find('option:selected');
	if(eval(selectedOption.val()) != 1){
		$('#'+tabla).hide();
	}else{
		$('#'+tabla).show();
	}
}

/*
function sumarTerrenos(){
	var total = 0;
	if($('#txt_terr_cultovoCafe').val() != '')
		total += eval($('#txt_terr_cultovoCafe').val());
	if($('#txt_terr_cultivoGranos').val() != '')
		total += eval($('#txt_terr_cultivoGranos').val());
	if($('#txt_terr_cultivoPastos').val() != '')
		total += eval($('#txt_terr_cultivoPastos').val());
	if($('#txt_terr_cultivoGuamiles').val() != '')
		total += eval($('#txt_terr_cultivoGuamiles').val());
	if($('#txt_terr_cultivoHortalizas').val() != '')
		total += eval($('#txt_terr_cultivoHortalizas').val());
	if($('#txt_terr_cultivoFrutales').val() != '')
		total += eval($('#txt_terr_cultivoFrutales').val());
	if($('#txt_terr_cultivoBosques').val() != '')
		total += eval($('#txt_terr_cultivoBosques').val());
	if($('#txt_terr_cultivoLagunas').val() != '')
		total += eval($('#txt_terr_cultivoLagunas').val());
	$('#txt_terr_total').val(total);
}
*/

function sumarTerrenos(){
	var total = 0;
		total += eval($('#txt_terr_cultovoCafe').autoNumeric("get").length==0?0:$('#txt_terr_cultovoCafe').autoNumeric("get"));
		total += eval($('#txt_terr_cultivoGranos').autoNumeric("get").length==0?0:$('#txt_terr_cultivoGranos').autoNumeric("get"));
		total += eval($('#txt_terr_cultivoPastos').autoNumeric("get").length==0?0:$('#txt_terr_cultivoPastos').autoNumeric("get"));
		total += eval($('#txt_terr_cultivoGuamiles').autoNumeric("get").length==0?0:$('#txt_terr_cultivoGuamiles').autoNumeric("get"));
		total += eval($('#txt_terr_cultivoHortalizas').autoNumeric("get").length==0?0:$('#txt_terr_cultivoHortalizas').autoNumeric("get"));
		total += eval($('#txt_terr_cultivoFrutales').autoNumeric("get").length==0?0:$('#txt_terr_cultivoFrutales').autoNumeric("get"));
		total += eval($('#txt_terr_cultivoBosques').autoNumeric("get").length==0?0:$('#txt_terr_cultivoBosques').autoNumeric("get"));
		total += eval($('#txt_terr_cultivoLagunas').autoNumeric("get").length==0?0:$('#txt_terr_cultivoLagunas').autoNumeric("get"));
		
	$('#txt_terr_total').autoNumeric("set", total);
}
/*
function sumaTerrenoCasa(){
	var total = 0;
	if($('#txt_terr_cultovoCafeMetros').val() != '')
		total += eval($('#txt_terr_cultovoCafeMetros').val());
	if($('#txt_terr_cultivoGranosMetros').val() != '')
		total += eval($('#txt_terr_cultivoGranosMetros').val());
	if($('#txt_terr_cultivoPastosMetros').val() != '')
		total += eval($('#txt_terr_cultivoPastosMetros').val());
	if($('#txt_terr_cultivoGuamilesMetros').val() != '')
		total += eval($('#txt_terr_cultivoGuamilesMetros').val());
	if($('#txt_terr_cultivoHortalizasMetros').val() != '')
		total += eval($('#txt_terr_cultivoHortalizasMetros').val());
	if($('#txt_terr_cultivoFrutalesMetros').val() != '')
		total += eval($('#txt_terr_cultivoFrutalesMetros').val());
	if($('#txt_terr_cultivoBosquesMetros').val() != '')
		total += eval($('#txt_terr_cultivoBosquesMetros').val());
	if($('#txt_terr_cultivoLagunasMetros').val() != '')
		total += eval($('#txt_terr_cultivoLagunasMetros').val());
	
	if($('#txt_terr_areaCasa_Norte').val() != '')
		total += eval($('#txt_terr_areaCasa_Norte').val());
	if($('#txt_terr_areaCasa_sur').val() != '')
		total += eval($('#txt_terr_areaCasa_sur').val());
	if($('#txt_terr_areaCasa_este').val() != '')
		total += eval($('#txt_terr_areaCasa_este').val());
	if($('#txt_terr_areaCasa_oeste').val() != '')
		total += eval($('#txt_terr_areaCasa_oeste').val());
	if($('#txt_terr_areaCasa_construcion').val() != '')
		total += eval($('#txt_terr_areaCasa_construcion').val());
	
	$('#txt_terr_areaCasa_TotalconstrucionMetros').val(total.toFixed(2));
	$('#txt_terr_areaCasa_Totalconstrucion').val(Math.ceil(total/7000));
}
*/

function sumaTerrenoCasa(){
	var total = 0;
		total += eval($('#txt_terr_cultovoCafeMetros').autoNumeric("get").length==0?0:$('#txt_terr_cultovoCafeMetros').autoNumeric("get"));
		total += eval($('#txt_terr_cultivoGranosMetros').autoNumeric("get").length==0?0:$('#txt_terr_cultivoGranosMetros').autoNumeric("get"));
		total += eval($('#txt_terr_cultivoPastosMetros').autoNumeric("get").length==0?0:$('#txt_terr_cultivoPastosMetros').autoNumeric("get"));
		total += eval($('#txt_terr_cultivoGuamilesMetros').autoNumeric("get").length==0?0:$('#txt_terr_cultivoGuamilesMetros').autoNumeric("get"));
		total += eval($('#txt_terr_cultivoHortalizasMetros').autoNumeric("get").length==0?0:$('#txt_terr_cultivoHortalizasMetros').autoNumeric("get"));
		total += eval($('#txt_terr_cultivoFrutalesMetros').autoNumeric("get").length==0?0:$('#txt_terr_cultivoFrutalesMetros').autoNumeric("get"));
		total += eval($('#txt_terr_cultivoBosquesMetros').autoNumeric("get").length==0?0:$('#txt_terr_cultivoBosquesMetros').autoNumeric("get"));
		total += eval($('#txt_terr_cultivoLagunasMetros').autoNumeric("get").length==0?0:$('#txt_terr_cultivoLagunasMetros').autoNumeric("get"));
	
		total += eval($('#txt_terr_areaCasa_Norte').autoNumeric("get").length==0?0:$('#txt_terr_areaCasa_Norte').autoNumeric("get"));
		total += eval($('#txt_terr_areaCasa_sur').autoNumeric("get").length==0?0:$('#txt_terr_areaCasa_sur').autoNumeric("get"));
		total += eval($('#txt_terr_areaCasa_este').autoNumeric("get").length==0?0:$('#txt_terr_areaCasa_este').autoNumeric("get"));
		total += eval($('#txt_terr_areaCasa_oeste').autoNumeric("get").length==0?0:$('#txt_terr_areaCasa_oeste').autoNumeric("get"));
		total += eval($('#txt_terr_areaCasa_construcion').autoNumeric("get").length==0?0:$('#txt_terr_areaCasa_construcion').autoNumeric("get"));
	
	$('#txt_terr_areaCasa_TotalconstrucionMetros').autoNumeric("set",total);
	$('#txt_terr_areaCasa_Totalconstrucion').autoNumeric("set", Math.ceil(total/7000));
}

function cargaDataPrevia(objectColl){
	console.log($(objectColl).collapsible());
	
}

function cambioEstadoHipotecaria(combo){
	var selectedOption = $(combo).find('option:selected');
	switch(eval(selectedOption.val())) { 
	case 1:
		$('#div_hipo_dimInmuebleSolar').show();
		$('#div_hipo_dimInmuebleSolarCasa').hide();
		$('#div_hipo_dimInmuebleTerreno').hide();
		$('#tb_terr_areaCasa').hide();
		break;
	case 2:
		$('#div_hipo_dimInmuebleSolar').hide();
		$('#div_hipo_dimInmuebleSolarCasa').show();
		$('#div_hipo_dimInmuebleTerreno').hide();
		$('#tb_terr_areaCasa').hide();
		break;
	case 3:
		$('#div_hipo_dimInmuebleSolar').hide();
		$('#div_hipo_dimInmuebleSolarCasa').hide();
		$('#div_hipo_dimInmuebleTerreno').show();
		$('#tb_terr_areaCasa').hide();
		break;
	case 4:
		$('#div_hipo_dimInmuebleSolar').hide();
		$('#div_hipo_dimInmuebleSolarCasa').hide();
		$('#div_hipo_dimInmuebleTerreno').show();
		$('#tb_terr_areaCasa').show();
		break;
	}
}

function cambioEstadoCivil(comboEstadoCivil,trTarget,divTarget,optTdTarget){
	var selectedOption = $(comboEstadoCivil).find('option:selected');
	if(eval(selectedOption.val()) != 1){
		if(trTarget == undefined){
			$('#tr_noSoltero').show();
			$('#datosConyuge').show();			
		}else{
			if(optTdTarget != undefined)
				$('#'+optTdTarget).show();
			if(divTarget != undefined)
				$('#'+divTarget).show();
			$('#'+trTarget).show();
		}
	}
	else{
		if(trTarget == undefined){
			$('#tr_noSoltero').hide();
			$('#datosConyuge').hide();
		}else{
			if(optTdTarget != undefined)
				$('#'+optTdTarget).hide();
			if(divTarget != undefined)
				$('#'+divTarget).hide();
			$('#'+trTarget).hide();
		}
	}
}

function cambioReferencia(comboReferencia){
	var selectedOption = $(comboReferencia).find('option:selected');
	if(eval(selectedOption.val()) == 1){
		$('#ref_bancarias').show();
		$('#ref_comerciales').hide();
		$('#ref_personales').hide();
	}else if(eval(selectedOption.val()) == 2){
		$('#ref_bancarias').hide();
		$('#ref_comerciales').show();
		$('#ref_personales').hide();		
	}else{
		$('#ref_bancarias').hide();
		$('#ref_comerciales').hide();
		$('#ref_personales').show();
	}
}

function capturePhoto(imgHtml){
	//return;
	$.mobile.loading("show");
    navigator.camera.getPicture(
            function(imageData) {
            	/*var db = app.webdb.db;
            	db.transaction(function(tx){
            		tx.executeSql("UPDATE JUGADOR SET FOTO_JUGADOR = ? WHERE ID_JUGADOR = ?", [imageData,idJugador]);//fin executeSql
            	});//fin transaction*/
            	$(imgHtml).removeAttr('src');
            	$(imgHtml).attr('src','data:image/jpeg;base64,' + imageData);
            	$('#'+$(imgHtml).attr('id')+'_hd').val(imageData);
            	$.mobile.loading("hide");
            },
            function(message) {
            	$.mobile.loading("hide");
            	if(message.toLowerCase() != "Camera cancelled.".toLowerCase()){
            	    navigator.notification.alert(
            	            'Error: '+message,  // message
            	            alertDismissed,         // callback
            	            'Alerta',          // title
            	            'Aceptar'        // buttonName
            	    );
            	}//fin if
            },
            {quality: 50,
             destinationType: 0,
             correctOrientation: true});
}

function sincronizarFormDinamicos(idFormulario){
	var r = confirm("\xbfDesea sincronizar el formulario?");
	var db = app.webdb.db;
	if(r == true){
		$.ajax({
		    type: "POST",
		    dataType: 'jsonp',
		    jsonp: "jsoncallback",
		    url: "http://201.190.32.76/frontend/www/index.php/api/getForm",
		    data: ({id: idFormulario}),
		    cache: false,
		    dataType: "text",
		    beforeSend: function(objeto){
		    	$.mobile.loading( "show", {
				  text: "Cargando Formulario:"+idFormulario,
				  textVisible: true,
				  theme: "a"
				});
		    	console.log("Inicia importacion de formulario: "+idFormulario);
			},
		    success: function(datos){
		    	$.mobile.loading("hide");
		    	console.log("finalizo importacion de formulario: "+idFormulario);
		    	//console.log("datos:"+datos);
		    	//ACTUALIZAR LA DATA EN LA BASE
		    	db.transaction(function(tx){
					tx.executeSql("UPDATE FORMULARIOS SET HTML = ?,FECHA_SINCRO = strftime('%Y-%m-%d','now','localtime') WHERE ID_FORMULARIO = ?", [datos,idFormulario]);
		    	},function(){}//error
		    	,function(){//exito
		    		var idDiv = "";
		    		switch (idFormulario) {
					case 1:
						idDiv = "div_datosGenerales";
						break;
					case 2:
						idDiv = "div_datosCreditos";
						break;
					case 3:
						idDiv = "div_ahorros";
						break;
					case 4:
						idDiv = "div_depositosPlazo";
						break;
					case 5:
						idDiv = "div_fiduciario";
						break;
					case 6:
						idDiv = "div_hipotecaria";
						break;
					case 7:
						idDiv = "div_prendaria";
						break;
					case 8:
						idDiv = "div_remesas";
						break;
					}//fin switch
		    		$('#'+idDiv).html(datos);
					$('#'+idDiv+' div').collapsible();
					$('#'+idDiv+' select').selectmenu();
					$('#'+idDiv+' input[type!="button"]').textinput();
					$('#'+idDiv+' :button').button();
				}
		    	);
			},
		    error: function(objeto, mensaje, otroobj){
		    	$.mobile.loading("hide");
		    	console.log("Trono importacion de formulario: "+idFormulario);
		    }
		});//fin ajax
		
	}//fin confirm
}

function enviarDatosAWeb(){
	var perfiles;
	var formularios;
	var imagenes;
	
	perfiles = $('#sperfiles').is(':checked');
	formularios = $('#ssolicitudes').is(':checked');
	imagenes = $('#simagenes').is(':checked');
	
	var db = app.webdb.db;
	var query = "SELECT ID_CAP_CUSTOMER,FIRSTNAME,MIDNAME,LASTNAME1,LASTNAME2,TYPE_IDENTITY,IDENTITY,GENDER,strftime('%d/%m/%Y',BIRTHDAY) BIRTHDAY,STATUS,NATIONALITY,OCUPATION,EDUCATION,ACTIVE,strftime('%d/%m/%Y',DATE_CREATED) DATE_CREATED FROM CAP_CUSTOMER";
	var json = "";
	var jsonForm = "";
	var jsonImagenes = "";
	
	db.transaction(function(tx){
		if(perfiles){
			tx.executeSql(query,[],function(tx,results){
				var len = results.rows.length;
				json = '{"CAP_CUSTOMER":[';
				for(var i=0;i<len;i++){
					var row = results.rows.item(i);
					json += '{"ID_CAP_CUSTOMER":"'+row['ID_CAP_CUSTOMER']+'","FIRSTNAME":"'+row['FIRSTNAME']+'","MIDNAME":"'+row['MIDNAME']+'","LASTNAME1":"'+row['LASTNAME1']+'","LASTNAME2":"'+row['LASTNAME2']+'","TYPE_IDENTITY":"'+row['TYPE_IDENTITY']+'","IDENTITY":"'+row['IDENTITY']+'","GENDER":"'+row['GENDER']+'",';
					json += '"BIRTHDAY":"'+row['BIRTHDAY']+'","STATUS":"'+row['STATUS']+'","NATIONALITY":"'+row['NATIONALITY']+'","OCUPATION":"'+row['OCUPATION']+'","EDUCATION":"'+row['EDUCATION']+'","ACTIVE":"'+row['ACTIVE']+'","DATE_CREATED":"'+row['DATE_CREATED']+'"},';
				}//fin for
				json = json.substr(0,json.length-1);
				json += ']}';
				//console.log(json);
			});	
		}//fin perfiles
		if(formularios){
			tx.executeSql("SELECT C.ID_SERVER, S.FORM_PROD, S.CUSTOMER_REQUESTS,S.FORM,S.FORM_RESPONSE,strftime('%d/%m/%Y',S.DATE_CREATED) DATE_CREATED FROM STORAGE S JOIN CAP_CUSTOMER C ON S.CUSTOMER_REQUESTS = C.ID_CAP_CUSTOMER",[],function(tx,results){
				var len = results.rows.length;
				jsonForm = '{"FORMULARIOS":[';
				for(var j=0;j<len;j++){
					var row = results.rows.item(j);
					jsonForm += '{"FORM_PROD":"'+row['FORM_PROD']+'","ID_SERVER":"'+row['ID_SERVER']+'","CUSTOMER_REQUESTS":"'+row['CUSTOMER_REQUESTS']+'","DATE_CREATED":"'+row['DATE_CREATED']+'","FORM":"'+row['FORM']+'","FORM_RESPONSE":'+row['FORM_RESPONSE']+'},';
				}//fin for
				jsonForm = jsonForm.substr(0,jsonForm.length-1);
				jsonForm += ']}';
				//console.log(jsonForm);
			});
		}//fin formularios
		if(imagenes){
			var queryImgs = "SELECT C.ID_CAP_CUSTOMER,F.ID_IMG,FOTO FROM FOTOS F JOIN STORAGE S ON F.ID_STORAGE = S.ID JOIN CAP_CUSTOMER C ON S.CUSTOMER_REQUESTS = C.ID_CAP_CUSTOMER ORDER BY C.ID_CAP_CUSTOMER";
			tx.executeSql(queryImgs,[],function(tx,results){
				var len = results.rows.length;
				jsonImagenes = '{"IMAGENES":[';
				for(var j=0;j<len;j++){
					var row = results.rows.item(j);
					jsonImagenes += '{"CUSTOMER_REQUESTS":"'+row['ID_CAP_CUSTOMER']+'","ID_IMG":"'+row['ID_IMG']+'","FOTO":"'+row['FOTO']+'},';
				}//fin for
				jsonImagenes = jsonImagenes.substr(0,jsonImagenes.length-1);
				jsonImagenes += ']}';
				//console.log(jsonImagenes);
			});
		}//fin imagenes
	}, app.webdb.onError,function(){
		//console.log(json);
		//console.log(jsonForm);
		//console.log(jsonImagenes);
		if(formularios && !perfiles && !imagenes){
			$.ajax({
	            type: "POST",
	            dataType: 'jsonp',
	            jsonp: "jsoncallback",
	            url: "http://201.190.32.76/frontend/www/index.php/api/syncCustomer",
	            data: ({obj: jsonForm,idusr:userLoginGlobal.getUserid()}),
	            cache: false,
	            dataType: "text",
	  		    beforeSend: function(objeto){$.mobile.loading("show"); console.log("inicia formularios.");},
			    success: function(datos){$.mobile.loading("hide"); console.log("finalizo formularios."); exitoSincronizacion(datos); },
			    error: function(objeto, mensaje, otroobj){$.mobile.loading("hide"); console.log("Trono formularios."); }
			});
		}else if(!imagenes && !formularios && perfiles){
			$.ajax({
	            type: "POST",
	            dataType: 'jsonp',
	            jsonp: "jsoncallback",
	            url: "http://201.190.32.76/frontend/www/index.php/api/syncCustomer",
	            data: ({obj: json,idusr:userLoginGlobal.getUserid()}),
	            cache: false,
	            dataType: "text",
	  		    beforeSend: function(objeto){$.mobile.loading("show");console.log("inicia perfiles.");},
			    success: function(datos){$.mobile.loading("hide"); console.log("finalizo perfiles.");exitoSincronizacion(datos); },
			    error: function(objeto, mensaje, otroobj){$.mobile.loading("hide"); console.log("Trono perfiles.") }
			});
		}else if(imagenes && !formularios && !perfiles){
			$.ajax({
	            type: "POST",
	            dataType: 'jsonp',
	            jsonp: "jsoncallback",
	            url: "http://201.190.32.76/frontend/www/index.php/api/syncCustomer",
	            data: ({obj: jsonImagenes,idusr:userLoginGlobal.getUserid()}),
	            cache: false,
	            dataType: "text",
	  		    beforeSend: function(objeto){$.mobile.loading("show");console.log("inicia imagenes.");},
			    success: function(datos){$.mobile.loading("hide"); console.log("finalizo imagenes.");exitoSincronizacion(datos); },
			    error: function(objeto, mensaje, otroobj){$.mobile.loading("hide"); console.log("Trono imagenes.") }
			});
		}else if(formularios && perfiles && imagenes){
			$.ajax({
	            type: "POST",
	            dataType: 'jsonp',
	            jsonp: "jsoncallback",
	            url: "http://201.190.32.76/frontend/www/index.php/api/syncCustomer",
	            data: ({obj: json,idusr:userLoginGlobal.getUserid()}),
	            cache: false,
	            dataType: "text",
	  		    beforeSend: function(objeto){$.mobile.loading("show");console.log("inicia perfiles.");},
			    success: function(datos){
					exitoSincronizacion(datos, false);
			    	console.log("Finalizo perfiles.");
			    	$.ajax({
			            type: "POST",
			            dataType: 'jsonp',
			            jsonp: "jsoncallback",
			            url: "http://201.190.32.76/frontend/www/index.php/api/syncCustomer",
			            data: ({obj: jsonForm,idusr:userLoginGlobal.getUserid()}),
			            cache: false,
			            dataType: "text",
			  		    beforeSend: function(objeto){$.mobile.loading("show");console.log("inicia formularios.");},
					    success: function(datos){
					    	$.ajax({
					            type: "POST",
					            dataType: 'jsonp',
					            jsonp: "jsoncallback",
					            url: "http://201.190.32.76/frontend/www/index.php/api/syncCustomer",
					            data: ({obj: jsonImagenes,idusr:userLoginGlobal.getUserid()}),
					            cache: false,
					            dataType: "text",
					  		    beforeSend: function(objeto){$.mobile.loading("show");console.log("inicia imagenes.");},
							    success: function(datos){$.mobile.loading("hide"); console.log("finalizo imagenes.");exitoSincronizacion(datos); },
							    error: function(objeto, mensaje, otroobj){$.mobile.loading("hide"); console.log("Trono imagenes.") }
							});
					    	console.log("finalizo formularios.");
					    },
					    error: function(objeto, mensaje, otroobj){$.mobile.loading("hide"); console.log("Trono formularios.") }
					});
			    },
			    error: function(objeto, mensaje, otroobj){$.mobile.loading("hide"); console.log("Trono perfiles.") }
			});
		}else if(formularios && perfiles && !imagenes){
			$.ajax({
	            type: "POST",
	            dataType: 'jsonp',
	            jsonp: "jsoncallback",
	            url: "http://201.190.32.76/frontend/www/index.php/api/syncCustomer",
	            data: ({obj: json,idusr:userLoginGlobal.getUserid()}),
	            cache: false,
	            dataType: "text",
	  		    beforeSend: function(objeto){$.mobile.loading("show");console.log("inicia perfiles.");},
			    success: function(datos){
					exitoSincronizacion(datos, false);
					// Cargos los formularios con el nuevo ID del cliente  desde el servidor
					db.transaction(function (tx) { 
						tx.executeSql("SELECT C.ID_SERVER, S.FORM_PROD, S.CUSTOMER_REQUESTS,S.FORM,S.FORM_RESPONSE,strftime('%d/%m/%Y',S.DATE_CREATED) DATE_CREATED FROM STORAGE S JOIN CAP_CUSTOMER C ON S.CUSTOMER_REQUESTS = C.ID_CAP_CUSTOMER",[],function(tx,results){
							var len = results.rows.length;
							jsonForm = '{"FORMULARIOS":[';
							for(var j=0;j<len;j++){
								var row = results.rows.item(j);
								jsonForm += '{"FORM_PROD":"'+row['FORM_PROD']+'","ID_SERVER":"'+row['ID_SERVER']+'","CUSTOMER_REQUESTS":"'+row['CUSTOMER_REQUESTS']+'","DATE_CREATED":"'+row['DATE_CREATED']+'","FORM":"'+row['FORM']+'","FORM_RESPONSE":'+row['FORM_RESPONSE']+'},';
							}//fin for
							jsonForm = jsonForm.substr(0,jsonForm.length-1);
							jsonForm += ']}';
							//console.log(jsonForm);
						}, null);
					});
			    	console.log("Finalizo perfiles.");
			    	$.ajax({
			            type: "POST",
			            dataType: 'jsonp',
			            jsonp: "jsoncallback",
			            url: "http://201.190.32.76/frontend/www/index.php/api/syncCustomer",
			            data: ({obj: jsonForm,idusr:userLoginGlobal.getUserid()}),
			            cache: false,
			            dataType: "text",
			  		    beforeSend: function(objeto){$.mobile.loading("show");console.log("inicia formularios.");},
					    success: function(datos){$.mobile.loading("hide"); console.log("finalizo imagenes.");exitoSincronizacion(datos);},
					    error: function(objeto, mensaje, otroobj){$.mobile.loading("hide"); console.log("Trono formularios.") }
					});
			    },
			    error: function(objeto, mensaje, otroobj){$.mobile.loading("hide"); console.log("Trono perfiles.") }
			});
		}else if(formularios && !perfiles && imagenes){
			$.ajax({
	            type: "POST",
	            dataType: 'jsonp',
	            jsonp: "jsoncallback",
	            url: "http://201.190.32.76/frontend/www/index.php/api/syncCustomer",
	            data: ({obj: jsonImagenes,idusr:userLoginGlobal.getUserid()}),
	            cache: false,
	            dataType: "text",
	  		    beforeSend: function(objeto){$.mobile.loading("show");console.log("inicia perfiles.");},
			    success: function(datos){
					exitoSincronizacion(datos, false);
			    	console.log("Finalizo perfiles.");
			    	$.ajax({
			            type: "POST",
			            dataType: 'jsonp',
			            jsonp: "jsoncallback",
			            url: "http://201.190.32.76/frontend/www/index.php/api/syncCustomer",
			            data: ({obj: jsonForm,idusr:userLoginGlobal.getUserid()}),
			            cache: false,
			            dataType: "text",
			  		    beforeSend: function(objeto){$.mobile.loading("show");console.log("inicia formularios.");},
					    success: function(datos){$.mobile.loading("hide"); console.log("finalizo imagenes.");exitoSincronizacion(datos);},
					    error: function(objeto, mensaje, otroobj){$.mobile.loading("hide"); console.log("Trono formularios.") }
					});
			    },
			    error: function(objeto, mensaje, otroobj){$.mobile.loading("hide"); console.log("Trono perfiles.") }
			});
		}else if(!formularios && perfiles && imagenes){
			$.ajax({
	            type: "POST",
	            dataType: 'jsonp',
	            jsonp: "jsoncallback",
	            url: "http://201.190.32.76/frontend/www/index.php/api/syncCustomer",
	            data: ({obj: jsonImagenes,idusr:userLoginGlobal.getUserid()}),
	            cache: false,
	            dataType: "text",
	  		    beforeSend: function(objeto){$.mobile.loading("show");console.log("inicia perfiles.");},
			    success: function(datos){
					exitoSincronizacion(datos, false);
			    	console.log("Finalizo perfiles.");
			    	$.ajax({
			            type: "POST",
			            dataType: 'jsonp',
			            jsonp: "jsoncallback",
			            url: "http://201.190.32.76/frontend/www/index.php/api/syncCustomer",
			            data: ({obj: json,idusr:userLoginGlobal.getUserid()}),
			            cache: false,
			            dataType: "text",
			  		    beforeSend: function(objeto){$.mobile.loading("show");console.log("inicia formularios.");},
					    success: function(datos){$.mobile.loading("hide"); console.log("finalizo imagenes.");exitoSincronizacion(datos);},
					    error: function(objeto, mensaje, otroobj){$.mobile.loading("hide"); console.log("Trono formularios.") }
					});
			    },
			    error: function(objeto, mensaje, otroobj){$.mobile.loading("hide"); console.log("Trono perfiles.") }
			});
		}
	});
}

function exitoSincronizacion(datos, finalizado){
	finalizado = finalizado || true;

	var db = app.webdb.db;
	var perfiles;
	var formularios;
	var imagenes;
	
	if($('#sperfiles').is(':checked'))
		perfiles = "S";
	else
		perfiles = "N";
	if($('#ssolicitudes').is(':checked'))
		formularios = "S";
	else 
		formularios = "N";
	if($('#simagenes').is(':checked'))
		imagenes = "S";
	else
		imagenes = "N";

	console.log(datos);
	var json = JSON.parse(datos);
	$.each(json.clientes,function(id_cliente, id_cliente_server){
		db.transaction(function(tx){
			tx.executeSql("UPDATE CAP_CUSTOMER SET ID_SERVER = ? WHERE ID_CAP_CUSTOMER = ?",[id_cliente_server,id_cliente]);
		});
	});//fin each
	if(finalizado) {
		db.transaction(function(tx){
			tx.executeSql("INSERT INTO SINCRONIZACIONES(PERFILES,SOLICITUDES,IMAGENES,USER_ID,FECHA_SINCRO) VALUES(?,?,?,?,strftime('%Y-%m-%d','now','localtime'))",[perfiles,formularios,imagenes,userLoginGlobal.getUserid()]);
		},function(){},//error
		function(){//exito
			$('#sp_fec_sincronizacion').html(formatDate(new Date()));//formatDate funcion creada en app_complemento.
			$('#sp_fec_sincronizacion2').html(formatDate(new Date()));//formatDate funcion creada en app_complemento.
			//--------enviar mensaje de exito-------
			$('#div_contentMessage').html('La sincronizacion completada.');
			$('#div_subMessage').html('Estatus: <strong>completa</strong>');
			$('#div_subMessage').show();
			$('#div_sel_producto').hide();
			$('#btn_sel_producto').hide();
			irOpcion('msgExitos');
		});
	}
}

function inicialLogin(){
	//--------------------
	/*userLoginGlobal = new UserLogin();
	userLoginGlobal.setNombre($('#txt_user').val());
	userLoginGlobal.setPass($('#txt_pass').val());
	userLoginGlobal.setUserid(666);
	irOpcion('principal');
	return;*/
	//--------------------
	if($('#txt_user').val().trim().length == 0){
		$('#txt_user').css('border','1px solid red');
		alert("El Usuario es requerido.");
		return;
	}else{
		$('#txt_user').css('border','0px none rgb(51, 51, 51)');
	}
	if($('#txt_pass').val().trim().length == 0){
		$('#txt_pass').css('border','1px solid red');
		alert("La Contrase\u00f1a es requerida.");
		return;
	}else{
		$('#txt_pass').css('border','0px none rgb(51, 51, 51)');
	}
	// recolecta los valores que inserto el usuario
	var datosUsuario = $("#txt_user").val()
	var datosPassword = $("#txt_pass").val()
	$.mobile.loading("show");
	$.ajax({
        type: "POST",
        dataType: 'jsonp',
        jsonp: "jsoncallback",
        url: "http://201.190.32.76/frontend/www/index.php/api/login",
        data: ({usuario : datosUsuario,
    		password : datosPassword,
    		//equipo : device.uuid
    		}),
        cache: false,
        dataType: "text",
        timeout: 60000, //3 second timeout
	    beforeSend: function(objeto){$.mobile.loading("show");console.log("inicia logeo.");},
	    success: function(datos){
	    	var respuestaServer = JSON.parse(datos);
			//console.log(respuestaServer);
			$.mobile.loading("hide");
			if (respuestaServer.validacion == "ok") {
				userLoginGlobal = new UserLogin();
				userLoginGlobal.setNombre($('#txt_user').val());
				userLoginGlobal.setPass($('#txt_pass').val());
				userLoginGlobal.setUserid(respuestaServer.userid);
				userLoginGlobal.setRolename(respuestaServer.rolename);
				//console.log(respuestaServer.rolename);
				if(respuestaServer.rolename == "admonGears"){
					$('#div_btn_formDinamicos').show();
					$('#div_btn_datosSincro').hide();
					$('#btn_sincro').hide();
				}else{
					$('#div_btn_formDinamicos').hide();
					$('#div_btn_datosSincro').show();
					$('#btn_sincro').show();
				}
				$('#sp_mensaje').html(respuestaServer.mensajePortada);					

				$('#txt_pass').val('');
				irOpcion('principal');
			} else {
				alert(respuestaServer.mensaje);
			}
    	},
	    error: function(objeto, mensaje, otroobj){
	    	$.mobile.loading("hide"); 
	    	alert('Se agoto el tiempo de espera, imposible conectar con el servidor. (posible falla en la conexion de internet o desconexion del servidor).'); 
    	}
	});
}

function obtenerDivPorIdPagina(idPagina){
	var div = "n/a";
	if(idPagina == "clientes") // id = 1  
		div = "div_datosGenerales";
	else if(idPagina == "creditos") // id = 2
		div = "div_datosCreditos";
	else if(idPagina == "ahorros") // id = 3
		div = "div_ahorros";
	else if(idPagina == "depositosPlazo")// id = 4
		div = "div_depositosPlazo";
	else if(idPagina == "fiduciario")// id = 5
		div = "div_fiduciario";
	else if(idPagina == "hipotecaria")// id = 6
		div = "div_hipotecaria";
	else if(idPagina == "prendaria")// id = 7
		div = "div_prendaria";
	else if(idPagina == "")// id = 8
		div = "div_remesas";
	
	return div;
}

function cargarHtml(idPagina){
	var div = "";
	if(idPagina == 'logout')
		return;
	div = obtenerDivPorIdPagina(idPagina);
	if($('#'+div).html().trim().length > 0)
		return;
	
}

function guardarNotas(){
	var db = app.webdb.db;	
	db.transaction(function(tx){
		tx.executeSql("SELECT COUNT(ID_NOTA) CANT_NOTAS FROM NOTAS WHERE USER_ID = ?", [userLoginGlobal.getUserid()],function(tx, results){
			var cantNota = results.rows.item(0).CANT_NOTAS;
			if(cantNota == 0){
				tx.executeSql("INSERT INTO NOTAS(NOTA,USER_ID) VALUES(?,?)",[$("#txt_notas").val(),userLoginGlobal.getUserid()]);
			}else{
				tx.executeSql("UPDATE NOTAS SET NOTA = ? WHERE USER_ID = ?",[$("#txt_notas").val(),userLoginGlobal.getUserid()]);
			}
		});
	},function(){},//error
	function(){//exito
		alert('NOTA guarda.');
	});
}

function cargarNotas(){
	var db = app.webdb.db;	
	db.transaction(function(tx){
		tx.executeSql("SELECT NOTA FROM NOTAS WHERE USER_ID = ?", [userLoginGlobal.getUserid()],function(tx, results){
			if(results.rows.length != 0)
				$("#txt_notas").val(results.rows.item(0).NOTA);
			else
				$("#txt_notas").val("");
		});
	},function(){},//error
	function(){//exito
		$.mobile.changePage($('#pag_notas'));
	});
}

function irOpcion(idPagina,divLimpiar){
	var ret;
	$('#lb_cliente').html('Clientes');
	if(idPagina == 'buscar'){
		$('#lb_cliente').html('Buscador');
		paginaActual = 2;
		idPagina = 'clientes_list';
	}
	if(idPagina == 'notas'){
		cargarNotas();
		return;
	}
	ret = obtenerDivPorIdPagina(idPagina);
	console.log('div:'+ret);
	if(ret != "n/a"){
		if($('#'+ret).html().trim().length == 0){
			alert('El formulario que usted, trata de accesar, no esta disponible. Favor de sincronizar los formularios.');
			return;
		}
	}
	$.mobile.loading("show");
	if(divLimpiar != undefined){
		limpiarForm(divLimpiar);
	}
	//agregamos la inicializacion del autoNumeric
	$('.format_number').autoNumeric('init');
	if(idPagina == 'logout'){
		$.mobile.loading("hide");
		var isLogin = confirm("\xbfDeseas cerrar tu sesion?");
		if(isLogin){
			userLoginGlobal = new UserLogin();
			idPagina = 'login';
			$('#txt_user').val('');
			$('#txt_pass').val('');			
		}else
			return;
	}else if(idPagina == 'productos'){
		try{
			if(typeof(clientGlobal) != "object"){
				alert(typeof(clientGlobal));
				$.mobile.loading("hide");
				alert('Para ingresar a esta opci\u00f3n, debe buscar un cliente primero.');
				return;
			}else if(clientGlobal.getId().trim().length == 0){
				$.mobile.loading("hide");
				alert('Para ingresar a esta opci\u00f3n, debe buscar un cliente primero.');
				return;			
			}			
		}catch (e) {
			console.log(e)
		}		
		$('#productos_nombreCliente').html(clientGlobal.getPrimerNombre()+" "+clientGlobal.getSegundoNombre()+" "+clientGlobal.getPrimerApellido()+" "+clientGlobal.getSegundoApellido());
	}else if(idPagina == 'clientes_list'){
		cargarListaCliente();
	}else if(idPagina == 'clientes'){
		cargarDeps();
		cargarMuni(1);
		cargarAldea(1, 0)
		cargarEventosListas();
	}else if(idPagina == 'hipotecaria'){
		//agregamos la inicializacion del autoNumeric
		$(".format_number").autoNumeric('init');
		eventosHipotecarios() 
	}else if(idPagina == 'evalFinanciera'){
		//agregamos la inicializacion del autoNumeric
		$('.format_number').autoNumeric('init');
		evaluacionFinanciera();
	}else if(idPagina == 'fiduciario'){
		//agregamos la inicializacion del autoNumeric
		$(".format_number").autoNumeric('init');
		eventosFiduciarios();
	}
	else if(idPagina == 'creditos'){
		//agregamos la inicializacion del autoNumeric
		$(".format_number").autoNumeric('init');
		eventosCreditos();
	}
	else if(idPagina == 'ahorros'){
		//agregamos la inicializacion del autoNumeric
		$(".format_number").autoNumeric('init');
		eventosAhorros();
	}
	else if(idPagina == 'depositosPlazos'){
		//agregamos la inicializacion del autoNumeric
		$(".format_number").autoNumeric('init');
		eventosDepositos();
	}
	
	$.mobile.changePage($('#pag_'+idPagina));
	$.mobile.loading("hide");
}

//Eventos de los objetos del Formulario de Clientes
function cargarEventosListas() {
	//aplicamos mascaras
	$("#cb_tipoIdentificacion").on("change",function(){
		if($(this).find('option:selected').text() == "Cedula de Identidad" ) {
			$("#txt_noIdentidad").val("");
			$("#txt_noIdentidad").mask("0000-0000-00000");
		} else if($(this).find('option:selected').text() == "Carnet de Residente" ) {
			$("#txt_noIdentidad").val("");
			$("#txt_noIdentidad").mask("S000000");
		}
	});
	//Departamento y municipios
	$("#cb_departamento").on("change",function(){
		cargarMuni($(this).find('option:selected').val());return false;
	});	
	$("#cb_municipio").on("change",function(){
		cargarAldea($(this).find('option:selected').val(), $('#cb_departamento').find('option:selected').val()); return false;
	});
	$("#cb_viviendaPropia").on("change",function(){
		if($(this).val() == 2){
			$("#tbl_viviendaPropia").fadeOut("slow");
		} else {
			$("#tbl_viviendaPropia").fadeIn("slow");
		}
	});
	$("#cb_terrenos").on("change",function(){
		if($(this).val() == 2){
			$("#tbl_terrenos").fadeOut("slow");
		} else {
			$("#tbl_terrenos").fadeIn("slow");
		}
	});
	$("#cb_vehiculos").on("change",function(){
		if($(this).val() == 2){
			$("#tbl_vehiculos").fadeOut("slow");
		} else {
			$("#tbl_vehiculos").fadeIn("slow");
		}
	});

	$("#cb_totalmentePagados").on("change",function(){
		if($(this).val() == 1){
			$("#lbl_pagandoAOtroBienes").fadeOut("slow");
			$("#lbl_valorCoutaOtroBienes").fadeOut("slow");
		} else {
			// los textos
			$("#lbl_pagandoAOtroBienes").fadeIn("slow");
			$("#lbl_valorCoutaOtroBienes").fadeIn("slow");
		}
	});

	$("#cb_inscrita").on("change",function(){
		if($(this).val() == 1) {
			$("#lbl_hipotecada").fadeIn("slow");
			$("#lbl_viviendaentidad").fadeIn("slow");
		} else {
			$("#lbl_hipotecada").fadeOut("slow");
			$("#lbl_viviendaentidad").fadeOut("slow");
		}
	});

	$("#cb_inscritaTerreno").on("change",function(){
		if($(this).val() == 1) {
			$("#lbl_hipotecadaTerreno").fadeIn("slow");
			$("#lbl_terrenoentidad").fadeIn("slow");
		} else {
			$("#lbl_hipotecadaTerreno").fadeOut("slow");
			$("#lbl_terrenoentidad").fadeOut("slow");
		}
	});

	$("#cb_peps").on("change",function(){
		if($(this).val() == 1) {
			$("#tr_peps").fadeIn("slow");
		} else {
			$("#tr_peps").fadeOut("slow");
		}
	});

	$("#cb_pagado").on("change",function(){
		if($(this).val() == 2) {
			$("#lbl_vehiculopagado td:gt(0)").fadeIn("slow");
		} else {
			$("#lbl_vehiculopagado td:gt(0)").fadeOut("slow");
		}
	});

	$("#txt_fechaNacimiento").on("blur",function(){
		$("#txt_edad").val(calcular_edad($(this).val()));
	});

	$("#txt_fechaNacimientoConyuge").on("blur",function(){
		$("#txt_edadConyuge").val(calcular_edad($(this).val()));
	});

	$("#cb_referencias").on("change",function() {
		var selectedOption = $(this).find("option:selected");
		if(eval(selectedOption.val()) == 1){
			$("#ref_bancarias").show();
			$("#ref_comerciales").hide();
			$("#ref_personales").hide();
		} else if(eval(selectedOption.val()) == 2){
			$("#ref_bancarias").hide();
			$("#ref_comerciales").show();
			$("#ref_personales").hide();		
		} else {
			$("#ref_bancarias").hide();
			$("#ref_comerciales").hide();
			$("#ref_personales").show();
		}
	});

	$("#cb_estadoCivil").on("change", function (){
		var selectedOption = $(this).find("option:selected");
		if(eval(selectedOption.val()) != 1){
			$("#tr_noSoltero").show();
			$("#datosConyuge").show();			
		}
		else {
			$("#tr_noSoltero").hide();
			$("#datosConyuge").hide();
		}
	});

	$("#cb_empleado").on("change",function(){
		var selectedOption = $(this).find("option:selected");
		if(eval(selectedOption.val()) == 1){
			$("#datosEmpleado").show();			
		}
		else {
			$("#datosEmpleado").hide();
		}
	});

	$("#txt_valorada").on("change",function(){
		var vivienda = eval($("#txt_valorada").autoNumeric("get").length==0?0:$("#txt_valorada").autoNumeric("get"));
		var terreno = eval($("#txt_valoradaTerreno").autoNumeric("get").length==0?0:$("#txt_valoradaTerreno").autoNumeric("get"));
		var vehiculo = eval($("#txt_valor").autoNumeric("get").length==0?0:$("#txt_valor").autoNumeric("get"));
		var otros = eval($("#txt_valoradosOtroBienes").autoNumeric("get").length==0?0:$("#txt_valoradosOtroBienes").autoNumeric("get"));
		var total = vivienda + terreno + vehiculo + otros;
		
		$("#mt_patrimonio").autoNumeric("set", total);
		$("#hd_patrimonio").val(eval($("#mt_patrimonio").autoNumeric("get")));
	});
}

//Eventos de los objetos del Formulario de Creditos
function eventosCreditos() {
	$("#txt_cred_montoSolic").on("blur",function(){
		if($("#cb_cred_producto").val() == 0){
			alert("Debe Seleecionar un producto");
			$("#cb_cred_producto").focus();
			return false;
		}
		if($(this).val().length != 0){
			$.ajax({
				"type": "POST", 
				"url":  "http://201.190.32.76/frontend/www/index.php/product/getProdRates", 
				"data" : {"prod_id":$("#cb_cred_producto").val(), "monto":$("#txt_cred_montoSolic").val()},
				"success": function(d){
					data = JSON && JSON.parse(d) || $.parseJSON(d);
					if(!data.valid){
						alert("Informacion no cumple condiciones para el producto seleccionado.");
						$("#txt_cred_montoSolic").focus();
						$("#txt_cred_montoSolic").css({"background-color":"red"});
					} else {
						$("#txt_cred_montoSolic").css({"background-color":"white"});
					}
				},
			});
		}
	});

	$("#txt_cred_tasaInteres").on("blur",function(){
		if($(this).val().length != 0){
			$.ajax({
				"type": "POST", 
				"url":  "http://201.190.32.76/frontend/www/index.php/product/getProdRates", 
				"data" : {"prod_id":$("#cb_cred_producto").val(), "monto":$("#txt_cred_montoSolic").val(), "txt_cred_tasaInteres":$("#txt_cred_tasaInteres").val()},
				"success": function(d){
					data = JSON && JSON.parse(d) || $.parseJSON(d);
					if(!data.valid){
						alert("Informacion no cumple condiciones para el producto seleccionado.");
						$("#txt_cred_tasaInteres").focus();
						$("#txt_cred_tasaInteres").css({"background-color":"red"});
					} else {
						$("#txt_cred_tasaInteres").css({"background-color":"white"});
					}
				},
			});
		}
	});

	$("#txt_cred_plazo").on("blur",function(){
		if($(this).val().length != 0){
			$.ajax({
				"type": "POST", 
				"url":  "http://201.190.32.76/frontend/www/index.php/product/getProdRates", 
				"data" : {"prod_id":$("#cb_cred_producto").val(), "monto":$("#txt_cred_montoSolic").val(), "txt_cred_tasaInteres":$("#txt_cred_tasaInteres").val(), "txt_cred_plazo":$("#txt_cred_plazo").val()},
				"success": function(d){
					data = JSON && JSON.parse(d) || $.parseJSON(d);
					if(!data.valid){
						alert("Informacion no cumple condiciones para el producto seleccionado.");
						$("#txt_cred_plazo").focus();
						$("#txt_cred_plazo").css({"background-color":"red"});
					} else {
						$("#txt_cred_plazo").css({"background-color":"white"});
					}
				},
			});
		}
	});

	$("#cb_cred_metodologia").on("change",function(){
		if($(this).find('option:selected').text() == "Solidario") {
			$("#td_cred_grupo").fadeIn("slow");
		} else {
			$("#td_cred_grupo").fadeOut("slow");
		}	
	});

	$("#btnCotiza").click(function () { 
		var monto = $("#txt_cred_montoSolic").val();
		var tasa = $("#txt_cred_tasaInteres").val();
		var cuotas = $("#txt_cred_nCuotas").val();
		  if(monto == 0){
			alert("debe ingresar un monto");
			$("#txt_cred_montoSolic").focus();
			return false;
		  }
		  if(tasa == 0){
			alert("debe ingresar una tasa");
			$("#txt_cred_tasaInteres").focus();
			return false;
		  }
		  if(cuotas == 0){
			alert("debe ingresar el numero de cuotas");
			$("#txt_cred_nCuotas").focus();
			return false;
		  }
		  $("#frmCotiza").html('<div style="text-align:center;">Cargando Información...</div>');
		  $("#frmCotiza").load("http://201.190.32.76/frontend/www/index.php/product/cotizador?m="+monto+"&t="+tasa+"&c="+cuotas);
	});

	//para las garantias
	$(".showFidu").on("click", function(){
		$("#tbl_cred_garan_fiduciarios").toggle("slow");
	});
	$(".showHipo").on("click", function(){
		$("#tbl_cred_garan_hipotecaria").toggle("slow");
	});
	$(".showPrend").on("click", function(){
		$("#tbl_cred_garan_prendaria").toggle("slow");
	});
}

//Eventos de los objetos del Formulario de Ahorros
function eventosAhorros() {
	
}

//Eventos de los objetos del Formulario de Depositos
function eventosDepositos() {
	$("#cb_desPlazos_tipoIdentificacion1, #cb_desPlazos_tipoIdentificacion2").on("change",function(){
		if($(this).find('option:selected').text() == "Cedula de Identidad" ) {
			$("#txt_noIdentidad").val("");
			$("#txt_noIdentidad").mask("0000-0000-00000");
		} else if($(this).find('option:selected').text() == "Carnet de Residente" ) {
			$("#txt_noIdentidad").val("");
			$("#txt_noIdentidad").mask("S000000");
		}
	});
}

//Eventos de los objetos del Formulario de Remesas
function eventosRemesas() {}

function agregarLineasFactura(){
	var monto = $('#txt_fac_valor').val();
	if(monto.length == 0){
		alert('Debe ingresar un monto');
	}else{
		monto = eval($('#txt_fac_valor').val());
		if(monto == 0)
			alert('Debe ingresar un monto');
		else{
			var seq = $('#hd_seq').val();
			var comTiTrans = $('#cb_fac_tipoTransaccion').find('option:selected');
			var htmlTr = "<tr style='text-align: center;'><td>"+seq+"</td><td><input type='hidden' id='hd_fac_trans_"+seq+"' value='"+comTiTrans.val()+"'/>" + comTiTrans.text()+
					"</td><td>"+$('#txt_fac_tipoTrans').val()+"</td><td align='right'>"+monto.toFixed(2)+"</td></tr>";
			$('#nothing').hide();
			$('#details').append(htmlTr);
			$('#hd_seq').val(++seq);
			var total = eval($('#txt_fac_total').val());
			total += monto;
			$('#txt_fac_total').val(total);
			$('#lbl_fac_total').html(total.toFixed(2));
			$('#txt_fac_tipoTrans').val('');
			$('#txt_fac_valor').val('');
 		}
	}	
}

function cargarDeps(){
	var db = app.webdb.db;
	var query = "SELECT ID_DEP,NOMBRE FROM DEPARTAMENTO";
	var html = "";
	db.transaction(function(tx){
		tx.executeSql(query,[],function(tx,results){
			var len = results.rows.length;
			$('#cb_deparamento').html('');
			for(var i=0;i<len;i++){				
				var row = results.rows.item(i);
				html = '<option value="'+row['ID_DEP']+'">'+row['NOMBRE']+'</option>';
				$('#cb_deparamento').append(html);
			}//fin for
 			$('#cb_deparamento').selectmenu('refresh');
		});
	}, app.webdb.onError);
}

function cargarMuni(val){
	var db = app.webdb.db;
	var query = "SELECT CODE, NOMBRE FROM MUNICIPIO WHERE ID_DEP = ?";
	var html = "";
	db.transaction(function(tx){
		tx.executeSql(query,[val],function(tx,results){
			var len = results.rows.length;
			$('#cb_municipio').html('');
			for(var i=0;i<len;i++){				
				var row = results.rows.item(i);
				html = '<option value="'+row['CODE']+'">'+row['NOMBRE']+'</option>';
				$('#cb_municipio').append(html);
			}//fin for
 			$('#cb_municipio').selectmenu('refresh');
		});
	}, app.webdb.onError);
}

function cargarAldea(idm, idd){
	var db = app.webdb.db;
	var query = "SELECT ID_ALD,NOMBRE FROM ALDEA WHERE ID_MUN = ? AND ID_DEP = ?";
	var html = "";
	db.transaction(function(tx){
		tx.executeSql(query,[idm, idd],function(tx,results){
			var len = results.rows.length;
			$('#cb_aldea').html('');
			for(var i=0;i<len;i++){				
				var row = results.rows.item(i);
				html = '<option value="'+row['ID_ALD']+'">'+row['NOMBRE']+'</option>';
				$('#cb_aldea').append(html);
			}//fin for
 			$('#cb_aldea').selectmenu('refresh');
		});
	}, app.webdb.onError);
}

function cargarListaCliente(){
	var db = app.webdb.db;
	var query = "SELECT ID_CAP_CUSTOMER,FIRSTNAME,LASTNAME1,NATIONALITY,IDENTITY FROM CAP_CUSTOMER";
	var html = "";
	db.transaction(function(tx){
		tx.executeSql(query,[],function(tx,results){
			var len = results.rows.length;
			$('#ul_detalleCliente_list').html("");
			for(var i=0;i<len;i++){
				var row = results.rows.item(i);
				html = '<tr><td><img style="width:16px;height:16px;" src="images/ico-perfil.png" /></td>';
				html += '<td style="width: 60px">'+row['ID_CAP_CUSTOMER']+'</td><td>'+row['FIRSTNAME']+'</td><td>'+row['LASTNAME1']+'</td><td>'+row['IDENTITY']+'</td>';
				html += '<td width="16%"><img src="images/bot-seleccionar.png" onclick="llenarClienteSesion('+row['ID_CAP_CUSTOMER']+');return false;"/></td></tr>';
				$('#ul_detalleCliente_list').append(html);
			}//fin for
		});
	}, app.webdb.onError);
}

function llenarClienteSesion(idCliente){
	var db = app.webdb.db;
	var html = "";
	db.transaction(function(tx){
		tx.executeSql("SELECT ID,FORM_RESPONSE FROM STORAGE WHERE CUSTOMER_REQUESTS = ? and form = 1",[idCliente],function(tx,results){
			var len = results.rows.length;
			for(var i=0;i<len;i++){
				var row = results.rows.item(i);
				var jsonR = JSON.parse(row['FORM_RESPONSE']);
				$.each(jsonR,function(input, value){
					if(input != 'idFormulario'){
						if(input.indexOf("txt_") != -1){
							$('#'+input).val(value);
						}else if(input.indexOf("cb_") != -1){
							$('#'+input+' option').removeAttr('selected').filter('[value='+value+']').attr('selected', true);
							$('#'+input).selectmenu('refresh');
							//console.log('#'+input+' option[value='+value+']');
						}else if(input.indexOf("img_") != -1){
							if(value.length > 0){
								$('#'+input).attr('src','data:image/jpeg;base64,' + value);
								$('#'+input+'_hd').val(value);
							}else{
								$('#'+input+'_hd').val('');
								$('#'+input).attr('src','');
							}							
						}
					}//fin input != 'idFormulario'
				   // console.log('My array has at input ' + input + ', this value: ' + value); 
				});
				//PONER LAS FOTOS
				tx.executeSql("SELECT ID_IMG,FOTO FROM FOTOS WHERE ID_STORAGE = ?",[row['ID']],function(tx,results){
					var len = results.rows.length;
					for(var i=0;i<len;i++){
						var row = results.rows.item(i);
						var value = row['FOTO'];
						if(value.length > 0){
							$('#'+row['ID_IMG']).attr('src','data:image/jpeg;base64,' + value);
							$('#'+row['ID_IMG']+'_hd').val(value);
						}else{
							$('#'+row['ID_IMG']+'_hd').val('');
							$('#'+row['ID_IMG']).attr('src','');
						}
					}//fin for					
				});
			}//fin for
			clientGlobal = new Cliente();
			clientGlobal.cargarDatos(idCliente);//toma los valores de los input's
			console.log(clientGlobal.getId());
			//-----------llenar los formularios
			$('#txt_aho_noIdentidad').val(clientGlobal.getNoIdentidad());
			$('#txt_desPlazos_noIdentidad').val(clientGlobal.getNoIdentidad());
			$('#txt_cred_noIdentidad').val(clientGlobal.getNoIdentidad());
			$('#txt_fidu_noIdentidad').val(clientGlobal.getNoIdentidad());
			$('#txt_hipo_noIdentidad').val(clientGlobal.getNoIdentidad());
			$('#txt_pren_noIdentidad').val(clientGlobal.getNoIdentidad());
			
			$('#txt_aho_nombre').val(clientGlobal.getNombreCompleto());
			$('#txt_desPlazos_nombre').val(clientGlobal.getNombreCompleto());
			$('#txt_cred_nombre').val(clientGlobal.getNombreCompleto());
			$('#txt_fidu_nombre').val(clientGlobal.getNombreCompleto());
			$('#txt_hipo_nombre').val(clientGlobal.getNombreCompleto());
			$('#txt_pren_nombre').val(clientGlobal.getNombreCompleto());
			
			$('#txt_aho_codCliente').val(clientGlobal.getId());
			$('#txt_desPlazos_codCliente').val(clientGlobal.getId());
			$('#txt_cred_codCliente').val(clientGlobal.getId());
			$('#txt_fidu_codCliente').val(clientGlobal.getId());
			$('#txt_hipo_codCliente').val(clientGlobal.getId());
			$('#txt_pren_codCliente').val(clientGlobal.getId());
			
			$('#txt_rem_noIdentidad').val(clientGlobal.getNoIdentidad());
			$('#txt_rem_nombre').val(clientGlobal.getNombreCompleto());
			$('#txt_rem_codCliente').val(clientGlobal.getId());
			
			$('#txt_fac_nombre').val(clientGlobal.getNombreCompleto());
			$('#txt_fac_identidad').val(clientGlobal.getNoIdentidad());
			$('#txt_fac_usuario').val(userLoginGlobal.getNombre());
			$('#txt_fac_fecha').val(formatDate(new Date()))
			//-------------
			//--------enviar mensaje de exito-------
			$('#div_contentMessage').html('El perfil del cliente <h2>'+clientGlobal.getNombreCompleto()+'</h2><br/>ha sido cargado exitosamente.');
			$('#div_subMessage').hide();
			$('#div_sel_producto').show();
			$('#btn_sel_producto').show();
			//una vez cargado los valores, se deben de llevar al formulario requerido
			switch (paginaActual) {
			case 1:
				irOpcion('clientes');	
				break;
			case 2:
				db.transaction(function(tx){
					tx.executeSql("SELECT COUNT(FORM) CREDITOS,(SELECT COUNT(FORM) FROM STORAGE WHERE CUSTOMER_REQUESTS = ? and FORM = 3) CUENTA_AHORRO,(SELECT COUNT(FORM) FROM STORAGE WHERE CUSTOMER_REQUESTS = ? and FORM = 4) DEPOSITO_PLAZO,(SELECT COUNT(FORM) FROM STORAGE WHERE CUSTOMER_REQUESTS = ? and FORM = 8) REMESAS FROM STORAGE WHERE CUSTOMER_REQUESTS = ? and FORM = 2",[idCliente,idCliente,idCliente,idCliente],function(tx,results){
						var cant_creditos = results.rows.item(0).CREDITOS;
						var cant_ahorro = results.rows.item(0).CUENTA_AHORRO;
						var cant_depPlazo = results.rows.item(0).DEPOSITO_PLAZO;
						var cant_remesas = results.rows.item(0).REMESAS;
						$('#sol_credit_ing').html(cant_creditos);
						$('#sol_cue_ahorro').html(cant_ahorro);
						$('#sol_depos').html(cant_depPlazo);
						$('#sol_remesas').html(cant_remesas);
					});
				},function(){},//error
				function(){//exito
					irOpcion('productos');	
				});
				break;
			case 3:
				irOpcion('facturacion');
				break;
			}//fin switch
		});
	}, app.webdb.onError);
}

/*
function sumarEvaluaciones(){
	var total = 0;
	total += ($('#txt_cap_areaCulCafe_man_tol').val().length==0?0:eval($('#txt_cap_areaCulCafe_man_tol').val()));
	total += ($('#txt_cap_areaGranos_man_tol').val().length==0?0:eval($('#txt_cap_areaGranos_man_tol').val()));
	total += ($('#txt_cap_areaPastos_man_tol').val().length==0?0:eval($('#txt_cap_areaPastos_man_tol').val()));
	total += ($('#txt_cap_areaGuamiles_man_tol').val().length==0?0:eval($('#txt_cap_areaGuamiles_man_tol').val()));
	total += ($('#txt_cap_areaHortaliza_man_tol').val().length==0?0:eval($('#txt_cap_areaHortaliza_man_tol').val()));
	total += ($('#txt_cap_areaFrutal_man_tol').val().length==0?0:eval($('#txt_cap_areaFrutal_man_tol').val()));
	total += ($('#txt_cap_areaBosque_man_tol').val().length==0?0:eval($('#txt_cap_areaBosque_man_tol').val()));
	total += ($('#txt_cap_areaLaguna_man_tol').val().length==0?0:eval($('#txt_cap_areaLaguna_man_tol').val()));
	total += ($('#txt_cap_areaCasa_man_tol').val().length==0?0:eval($('#txt_cap_areaCasa_man_tol').val()));
	total += ($('#txt_cap_solCasa_areaConst_man_tol').val().length==0?0:eval($('#txt_cap_solCasa_areaConst_man_tol').val()));
	total += ($('#txt_cap_solCasa_areaSolar_man_tol').val().length==0?0:eval($('#txt_cap_solCasa_areaSolar_man_tol').val()));
	total += ($('#txt_cap_solCasa_areaAnexo_man_tol').val().length==0?0:eval($('#txt_cap_solCasa_areaAnexo_man_tol').val()));
	total += ($('#txt_cap_solCasa_areaMuroPer_man_tol').val().length==0?0:eval($('#txt_cap_solCasa_areaMuroPer_man_tol').val()));
	total += ($('#txt_cap_sol_areaSolar_man_tol').val().length==0?0:eval($('#txt_cap_sol_areaSolar_man_tol').val()));
	total += ($('#txt_cap_sol_areaMuro_man_tol').val().length==0?0:eval($('#txt_cap_sol_areaMuro_man_tol').val()));
	$('#txt_cap_total_avaluo').val(total.toFixed(2));
	$('#txt_cap_val_financiado').val((total*0.6).toFixed(2));
}
*/

function sumarEvaluaciones(){
	var total = 0;
	if($("#TerrenoCasa").is(":visible")){
		total += ($('#txt_cap_areaCulCafe_man_tol').autoNumeric("get").length==0?0:eval($('#txt_cap_areaCulCafe_man_tol').autoNumeric("get")));
		total += ($('#txt_cap_areaGranos_man_tol').autoNumeric("get").length==0?0:eval($('#txt_cap_areaGranos_man_tol').autoNumeric("get")));
		total += ($('#txt_cap_areaPastos_man_tol').autoNumeric("get").length==0?0:eval($('#txt_cap_areaPastos_man_tol').autoNumeric("get")));
		total += ($('#txt_cap_areaGuamiles_man_tol').autoNumeric("get").length==0?0:eval($('#txt_cap_areaGuamiles_man_tol').autoNumeric("get")));
		total += ($('#txt_cap_areaHortaliza_man_tol').autoNumeric("get").length==0?0:eval($('#txt_cap_areaHortaliza_man_tol').autoNumeric("get")));
		total += ($('#txt_cap_areaFrutal_man_tol').autoNumeric("get").length==0?0:eval($('#txt_cap_areaFrutal_man_tol').autoNumeric("get")));
		total += ($('#txt_cap_areaBosque_man_tol').autoNumeric("get").length==0?0:eval($('#txt_cap_areaBosque_man_tol').autoNumeric("get")));
		total += ($('#txt_cap_areaLaguna_man_tol').autoNumeric("get").length==0?0:eval($('#txt_cap_areaLaguna_man_tol').autoNumeric("get")));
		if($("#CasaTerreno").is(":visible")) {
			total += ($('#txt_cap_areaCasa_man_tol').autoNumeric("get").length==0?0:eval($('#txt_cap_areaCasa_man_tol').autoNumeric("get")));
		}
	} else if($("#SolarCasa").is(":visible")) {
		total += ($('#txt_cap_solCasa_areaSolar_man_tol').autoNumeric("get").length==0?0:eval($('#txt_cap_solCasa_areaSolar_man_tol').autoNumeric("get")));
		total += ($('#txt_cap_solCasa_casa1piso1_man_tol').autoNumeric("get").length==0?0:eval($('#txt_cap_solCasa_casa1piso1_man_tol').autoNumeric("get")));
		total += ($('#txt_cap_solCasa_casa1piso2_man_tol').autoNumeric("get").length==0?0:eval($('#txt_cap_solCasa_casa1piso2_man_tol').autoNumeric("get")));
		if($("#tbl_solarCasa_casa2").is(":visible")){
			total += ($('#txt_cap_solCasa_casa2piso1_man_tol').autoNumeric("get").length==0?0:eval($('#txt_cap_solCasa_casa2piso1_man_tol').autoNumeric("get")));
			total += ($('#txt_cap_solCasa_casa2piso2_man_tol').autoNumeric("get").length==0?0:eval($('#txt_cap_solCasa_casa2piso2_man_tol').autoNumeric("get")));
		}
		
		if($("#tbl_solarCasa_casa3").is(":visible")){
			total += ($('#txt_cap_solCasa_casa3piso1_man_tol').autoNumeric("get").length==0?0:eval($('#txt_cap_solCasa_casa3piso1_man_tol').autoNumeric("get")));
			total += ($('#txt_cap_solCasa_casa3piso2_man_tol').autoNumeric("get").length==0?0:eval($('#txt_cap_solCasa_casa3piso2_man_tol').autoNumeric("get")));
		}
		total += ($('#txt_cap_solCasa_areaAnexo_man_tol').autoNumeric("get").length==0?0:eval($('#txt_cap_solCasa_areaAnexo_man_tol').autoNumeric("get")));
		total += ($('#txt_cap_solCasa_areaInsta_man_tol').autoNumeric("get").length==0?0:eval($('#txt_cap_solCasa_areaInsta_man_tol').autoNumeric("get")));
		total += ($('#txt_cap_solCasa_areaMuroPer_man_tol').autoNumeric("get").length==0?0:eval($('#txt_cap_solCasa_areaMuroPer_man_tol').autoNumeric("get")));
	} else {
		total += ($('#txt_cap_sol_areaSolar_man_tol').autoNumeric("get").length==0?0:eval($('#txt_cap_sol_areaSolar_man_tol').autoNumeric("get")));
		total += ($('#txt_cap_sol_areaMuro_man_tol').autoNumeric("get").length==0?0:eval($('#txt_cap_sol_areaMuro_man_tol').autoNumeric("get")));
		total += ($('#txt_cap_sol_areaInsta_man_tol').autoNumeric("get").length==0?0:eval($('#txt_cap_sol_areaInsta_man_tol').autoNumeric("get")));
	}

	$('#txt_cap_total_avaluo').autoNumeric("set", total);
	$('#txt_cap_val_financiado').autoNumeric("set", (total*0.6));
}


function calcular_edad(fecha){

    //calculo la fecha de hoy
    hoy=new Date()
    //alert(hoy)

    //calculo la fecha que recibo
    //La descompongo en un array
    var array_fecha = fecha.split("/")
    //si el array no tiene tres partes, la fecha es incorrecta
    if (array_fecha.length!=3){
	    array_fecha = fecha.split("-");
		if (array_fecha.length!=3){
			return false
		}
	}
    //compruebo que los ano, mes, dia son correctos
    var ano
    ano = parseInt(array_fecha[2]);
    if (isNaN(ano))
       return false
	
    var mes
    mes = parseInt(array_fecha[1]);
    if (isNaN(mes))
       return false

    var dia
    dia = parseInt(array_fecha[0]);
    if (isNaN(dia))
       return false
	   
	if(ano <= 31){
		 ano = parseInt(array_fecha[0]);
		 dia = parseInt(array_fecha[2]);
	}

    //si el año de la fecha que recibo solo tiene 2 cifras hay que cambiarlo a 4
    if (ano<=99)
       ano +=1900

    //resto los años de las dos fechas
	var anohoy = hoy.getFullYear();
    edad= anohoy - ano - 1; //-1 porque no se si ha cumplido años ya este año

    //si resto los meses y me da menor que 0 entonces no ha cumplido años. Si da mayor si ha cumplido
    if (hoy.getMonth() + 1 - mes < 0) //+ 1 porque los meses empiezan en 0
       return edad
    if (hoy.getMonth() + 1 - mes > 0)
       return edad+1

    //entonces es que eran iguales. miro los dias
    //si resto los dias y me da menor que 0 entonces no ha cumplido años. Si da mayor o igual si ha cumplido
    if (hoy.getUTCDate() - dia >= 0)
       return edad + 1

    return edad
} 

function eventosFiduciarios(){
	calculoPatrimonioFiduciario();
		
	$('#txt_fidu_fechaNacimiento').on('blur',function(){
		$('#txt_fidu_edad').val(calcular_edad($(this).val()));
	});
	
	$('#txt_fidu_valoradaVivienda, #txt_terrenos_valoradaTerreno, #txt_fidu_valor, #txt_fidu_valoradosOtroBienes').on('blur',function(){
		calculoPatrimonioFiduciario();
		calculoActivoFiduciario();
	});
	
	$('#txt_fidu_cajaBancos, #txt_fidu_prestamos, #txt_fidu_cuentasCobrar, #txt_fidu_proveedores, #txt_fidu_mercaderia, #txt_fidu_salarioPension, #txt_fidu_otrosIngresos, #txt_fidu_otros').on('blur',function(){
		calculoActivoFiduciario();
	});

}

function eventosHipotecarios() {
	//despues de la carga y construccion de la pagina
	//personalizar el expand del acordion de evaluacion y captura
	$("#div_evaluacionCaptura").on("collapsibleexpand", function( event, ui ) {
	$("#txt_cap_areaCulCafe_man").val($("#txt_terr_cultovoCafe").val());
	$("#txt_cap_areaCulCafe_metros").val($("#txt_terr_cultovoCafeMetros").val());	
	
	$("#txt_cap_areaGranos_man").val($("#txt_terr_cultivoGranos").val());
	$("#txt_cap_areaGranos_metros").val($("#txt_terr_cultivoGranosMetros").val());	

	$("#txt_cap_areaPastos_man").val($("#txt_terr_cultivoPastos").val());
	$("#txt_cap_areaPastos_metros").val($("#txt_terr_cultivoPastosMetros").val());	

	$("#txt_cap_areaGuamiles_man").val($("#txt_terr_cultivoGuamiles").val());
	$("#txt_cap_areaGuamiles_metros").val($("#txt_terr_cultivoGuamilesMetros").val());	

	$("#txt_cap_areaHortaliza_man").val($("#txt_terr_cultivoHortalizas").val());
	$("#txt_cap_areaHortaliza_metros").val($("#txt_terr_cultivoHortalizasMetros").val());	
	
	$("#txt_cap_areaFrutal_man").val($("#txt_terr_cultivoFrutales").val());
	$("#txt_cap_areaFrutal_metros").val($("#txt_terr_cultivoFrutalesMetros").val());	

	$("#txt_cap_areaBosque_man").val($("#txt_terr_cultivoBosques").val());
	$("#txt_cap_areaBosque_metros").val($("#txt_terr_cultivoBosquesMetros").val());	

	$("#txt_cap_areaLaguna_man").val($("#txt_terr_cultivoLagunas").val());
	$("#txt_cap_areaLaguna_metros").val($("#txt_terr_cultivoLagunasMetros").val());
	
	$("#txt_cap_areaCasa_metros").val($("#txt_terr_areaCasa_construcion").val());
	
	$("#txt_cap_solCasa_areaConst_metros").val($("#txt_hipo_colinSolarCasa_areaContruc_med").val());
	$("#txt_cap_solCasa_areaSolar_metros").val($("#txt_hipo_colinSolarCasa_area_med").val());
	
	$("#txt_cap_solCasa_areaAnexo_metros").val($("#txt_hipo_colinSolarCasa_areaAnexo_med").val());
	$("#txt_cap_solCasa_areaMuroPer_metros").val($("#txt_hipo_colinSolarCasa_muro_med").val());
	$("#txt_cap_sol_areaSolar_metros").val($("#txt_hipo_colinSolar_area_med").val());
	$("#txt_cap_sol_areaMuro_metros").val($("#txt_hipo_colinSolar_muro_med").val());
	$("#txt_cap_sol_areaInsta_metros").val($("#txt_hipo_colinSolar_insta_med").val());
	
	$("#txt_cap_solCasa_areaAnexo_metros").val($("#txt_hipo_colinSolarCasa_anexo_med").val());
	$("#txt_cap_solCasa_areaInsta_metros").val($("#txt_hipo_colinSolarCasa_instala_med").val());

	$("#txt_cap_solCasa_casa1piso1_metros").val($("#txt_hipo_colinSolarCasa_casapiso1_med1").val());
	$("#txt_cap_solCasa_casa1piso2_metros").val($("#txt_hipo_colinSolarCasa_casapiso2_med1").val());
	
	if($("#tbl_solarCasa_casa2").is(":visible")){
		$("#txt_cap_solCasa_casa2piso1_metros").val($("#txt_hipo_colinSolarCasa_casapiso1_med2").val());
		$("#txt_cap_solCasa_casa2piso2_metros").val($("#txt_hipo_colinSolarCasa_casapiso2_med2").val());
	}
	
	if($("#tbl_solarCasa_casa3").is(":visible")){
		$("#txt_cap_solCasa_casa3piso1_metros").val($("#txt_hipo_colinSolarCasa_casapiso1_med3").val());
		$("#txt_cap_solCasa_casa3piso2_metros").val($("#txt_hipo_colinSolarCasa_casapiso2_med3").val());
	}
});

$("#cb_hipo_tipoInmueble").on("change",function(){
	var selectedOption = $(this).find("option:selected");
	switch(eval(selectedOption.val())) { 
	case 1:
		$("#div_hipo_dimInmuebleSolar").show();
		$("#div_hipo_dimInmuebleSolarCasa").hide();
		$("#div_hipo_dimInmuebleTerreno").hide();
		$("#tb_terr_areaCasa").hide();
		// hacemos lo mismo con las valuaciones
		$("#TerrenoCasa").hide();
		$("#CasaTerreno").hide();
		$("#SolarCasa").hide();
		$("#Solar").show();
		break;
	case 2:
		$("#div_hipo_dimInmuebleSolar").hide();
		$("#div_hipo_dimInmuebleSolarCasa").show();
		$("#div_hipo_dimInmuebleTerreno").hide();
		$("#tb_terr_areaCasa").hide();
		// hacemos lo mismo con las valuaciones
		$("#TerrenoCasa").hide();
		$("#CasaTerreno").hide();
		$("#Solar").hide();
		$("#SolarCasa").show();
		break;
	case 3:
		$("#div_hipo_dimInmuebleSolar").hide();
		$("#div_hipo_dimInmuebleSolarCasa").hide();
		$("#div_hipo_dimInmuebleTerreno").show();
		$("#tb_terr_areaCasa").hide();
		// hacemos lo mismo con las valuaciones
		$("#CasaTerreno").hide();
		$("#SolarCasa").hide();
		$("#Solar").hide();
		$("#TerrenoCasa").show();
		break;
	case 4:
		$("#div_hipo_dimInmuebleSolar").hide();
		$("#div_hipo_dimInmuebleSolarCasa").hide();
		$("#div_hipo_dimInmuebleTerreno").show();
		$("#tb_terr_areaCasa").show();
		// hacemos lo mismo con las valuaciones
		$("#SolarCasa").hide();
		$("#Solar").hide();
		$("#TerrenoCasa").show();
		$("#CasaTerreno").show();
		break;
	}
});

$("#cb_hipo_colinSolarCasa_ncasas").on("change",function(){
	var i = $(this).val();
	$(".ncasa").hide("slow");
	$(".valCasa").hide("slow");
	for(var j = 1; j <= i; j++)
	{
		$("#tbl_solarCasa_casa" + j).fadeIn("slow");
		$("#infoCasa" + j).fadeIn("slow");
	}
});
//Calculamos los precios
$("#txt_cap_areaCulCafe_man_val").on("blur", function(){
	var v1 =eval($("#txt_cap_areaCulCafe_man").autoNumeric("get").length==0?0:$("#txt_cap_areaCulCafe_man").autoNumeric("get"));
	var v2 =eval($("#txt_cap_areaCulCafe_man_val").autoNumeric("get").length==0?0:$("#txt_cap_areaCulCafe_man_val").autoNumeric("get"));
	var cant = v1 * v2;
	$("#txt_cap_areaCulCafe_man_tol").autoNumeric("set", cant); 
	
	sumarEvaluaciones();
});

$("#txt_cap_areaGranos_val").on("blur", function(){
	var v1 =eval($("#txt_cap_areaGranos_man").autoNumeric("get").length==0?0:$("#txt_cap_areaGranos_man").autoNumeric("get"));
	var v2 =eval($("#txt_cap_areaGranos_val").autoNumeric("get").length==0?0:$("#txt_cap_areaGranos_val").autoNumeric("get"));
	var cant = v1 * v2;
	$("#txt_cap_areaGranos_man_tol").autoNumeric("set", cant); 
	
	sumarEvaluaciones();
});

$("#txt_cap_areaPastos_val").on("blur", function(){
	var v1 =eval($("#txt_cap_areaPastos_man").autoNumeric("get").length==0?0:$("#txt_cap_areaPastos_man").autoNumeric("get"));
	var v2 =eval($("#txt_cap_areaPastos_val").autoNumeric("get").length==0?0:$("#txt_cap_areaPastos_val").autoNumeric("get"));
	var cant = v1 * v2;
	$("#txt_cap_areaPastos_man_tol").autoNumeric("set", cant); 
	
	sumarEvaluaciones();
});

$("#txt_cap_areaGuamiles_val").on("blur", function(){
	var v1 =eval($("#txt_cap_areaGuamiles_man").autoNumeric("get").length==0?0:$("#txt_cap_areaGuamiles_man").autoNumeric("get"));
	var v2 =eval($("#txt_cap_areaGuamiles_val").autoNumeric("get").length==0?0:$("#txt_cap_areaGuamiles_val").autoNumeric("get"));
	var cant = v1 * v2;
	$("#txt_cap_areaGuamiles_man_tol").autoNumeric("set", cant); 
	
	sumarEvaluaciones();
});

$("#txt_cap_areaHortaliza_val").on("blur", function(){
	var v1 =eval($("#txt_cap_areaHortaliza_man").autoNumeric("get").length==0?0:$("#txt_cap_areaHortaliza_man").autoNumeric("get"));
	var v2 =eval($("#txt_cap_areaHortaliza_val").autoNumeric("get").length==0?0:$("#txt_cap_areaHortaliza_val").autoNumeric("get"));
	var cant = v1 * v2;
	$("#txt_cap_areaHortaliza_man_tol").autoNumeric("set", cant); 
	
	sumarEvaluaciones();
});

$("#txt_cap_areaFrutal_val").on("blur", function(){
	var v1 =eval($("#txt_cap_areaFrutal_man").autoNumeric("get").length==0?0:$("#txt_cap_areaFrutal_man").autoNumeric("get"));
	var v2 =eval($("#txt_cap_areaFrutal_val").autoNumeric("get").length==0?0:$("#txt_cap_areaFrutal_val").autoNumeric("get"));
	var cant = v1 * v2;
	$("#txt_cap_areaFrutal_man_tol").autoNumeric("set", cant); 
	
	sumarEvaluaciones();
});

$("#txt_cap_areaBosque_val").on("blur", function(){
	var v1 =eval($("#txt_cap_areaBosque_man").autoNumeric("get").length==0?0:$("#txt_cap_areaBosque_man").autoNumeric("get"));
	var v2 =eval($("#txt_cap_areaBosque_val").autoNumeric("get").length==0?0:$("#txt_cap_areaBosque_val").autoNumeric("get"));
	var cant = v1 * v2;
	$("#txt_cap_areaBosque_man_tol").autoNumeric("set", cant); 
	
	sumarEvaluaciones();
});

$("#txt_cap_areaLaguna_val").on("blur", function(){
	var v1 =eval($("#txt_cap_areaLaguna_man").autoNumeric("get").length==0?0:$("#txt_cap_areaLaguna_man").autoNumeric("get"));
	var v2 =eval($("#txt_cap_areaLaguna_val").autoNumeric("get").length==0?0:$("#txt_cap_areaLaguna_val").autoNumeric("get"));
	var cant = v1 * v2;
	$("#txt_cap_areaLaguna_man_tol").autoNumeric("set", cant); 
	
	sumarEvaluaciones();
});

$("#txt_cap_areaCasa_val").on("blur", function(){
	var v1 =eval($("#txt_cap_areaCasa_metros").autoNumeric("get").length==0?0:$("#txt_cap_areaCasa_metros").autoNumeric("get"));
	var v2 =eval($("#txt_cap_areaCasa_val").autoNumeric("get").length==0?0:$("#txt_cap_areaCasa_val").autoNumeric("get"));
	var cant = v1 * v2;
	$("#txt_cap_areaCasa_man_tol").autoNumeric("set", cant); 
	
	sumarEvaluaciones();
});
}

function calculoPatrimonioFiduciario()
{
	var b1 = $('#txt_fidu_valoradaVivienda').val()==""?0:$('#txt_fidu_valoradaVivienda').val();
	var b2 = $('#txt_terrenos_valoradaTerreno').val()==""?0:$('#txt_terrenos_valoradaTerreno').val();
	var b3 = $('#txt_fidu_valor').val()==""?0:$('#txt_fidu_valor').val();
	var b4 = $('#txt_fidu_valoradosOtroBienes').val()==""?0:$('#txt_fidu_valoradosOtroBienes').val();
	var fidu_patrimonio = parseFloat(b1)+parseFloat(b2)+parseFloat(b3)+parseFloat(b4);
	$('#txt_fidu_patrimonio').val(fidu_patrimonio.toFixed(2));
}

function calculoActivoFiduciario() 
{
	var b1 = $('#txt_fidu_valoradaVivienda').val()==""?0:$('#txt_fidu_valoradaVivienda').val();
	var b2 = $('#txt_terrenos_valoradaTerreno').val()==""?0:$('#txt_terrenos_valoradaTerreno').val();
	var b3 = $('#txt_fidu_valor').val()==""?0:$('#txt_fidu_valor').val();
	var b4 = $('#txt_fidu_valoradosOtroBienes').val()==""?0:$('#txt_fidu_valoradosOtroBienes').val();
	var vivienda = parseFloat(b1)+parseFloat(b2);
	
	$('#txt_fidu_viviendaTerrenos').val(vivienda.toFixed(2));
	$('#txt_fidu_vehiculos').val(parseFloat(b3).toFixed(2));
	$('#txt_fidu_maquinariaEnseres').val(parseFloat(b4).toFixed(2));
	
	var c1 = $('#txt_fidu_cajaBancos').val()==""?0:$('#txt_fidu_cajaBancos').val();
	var c2 = $('#txt_fidu_cuentasCobrar').val()==""?0:$('#txt_fidu_cuentasCobrar').val();
	var c3 = $('#txt_fidu_mercaderia').val()==""?0:$('#txt_fidu_mercaderia').val();
	var c4 = $('#txt_fidu_otros').val()==""?0:$('#txt_fidu_otros').val();
	var total = parseFloat(c1)+parseFloat(c2)+parseFloat(c3)+vivienda+parseFloat(b3)+parseFloat(b4)+parseFloat(c4);
	$('#txt_fidu_total').val(total.toFixed(2));
	
	var i1 = $('#txt_fidu_salarioPension').val()==""?0:$('#txt_fidu_salarioPension').val();
	var i2 = $('#txt_fidu_otrosIngresos').val()==""?0:$('#txt_fidu_otrosIngresos').val();
	var ingresos = parseFloat(i1) + parseFloat(i2);
	$('#txt_fidu_totalIngresos').val(ingresos.toFixed(2));
	var p1 = $('#txt_fidu_prestamos').val()==""?0:$('#txt_fidu_prestamos').val();
	var p2 = $('#txt_fidu_proveedores').val()==""?0:$('#txt_fidu_proveedores').val();
	var pasivos = parseFloat(p1) + parseFloat(p2);
	$('#txt_fidu_totalPasivo').val(pasivos.toFixed(2));
}

function calcularPlanInversion(){
	var totalCosto = 0;
	var total = 0;
	$("input[id*='txt_planInver_cant']").each(function(index, inputCant){
		var i = index + 1;
		var cant = Math.ceil($(inputCant).val());
		var costo = eval($('#txt_planInver_costUni'+i).autoNumeric('get').length==0?0:$('#txt_planInver_costUni'+i).autoNumeric('get'));
		totalCosto += costo;
		var subTotal = cant * costo;
		$('#txt_planInver_costoTotal'+i).autoNumeric('set', subTotal);
		total += eval(subTotal);
	});
	$('#txt_planInver_totalCosto').autoNumeric('set', totalCosto);
	$('#txt_planInver_costoTotal').autoNumeric('set', total);
}

function limpiarForm(idDiv){
	//proceso de limpiar el formulario
	$.each($('#'+idDiv+' input[type!="button"]'), function(index, input){
		$(input).val("");
	});
	$.each($('#'+idDiv+' select'), function(index, select){
		$(select).val($(select).children('option:first').val());
		$(select).selectmenu('refresh');
	});
}

function guardarFormulario(idDiv){
	var jsonText;
	var idForm;
	var flag = 0;//0 todas los campos son validos
	//alert('En construccion, guardarFormulario('+idDiv+')');	
	//validar los input requeridos
	//style="border:0px none rgb(51, 51, 51)"<--valor defecto
	$.each($('#'+idDiv+' input[required="required"]'), function(index, input){
		if(input.value.trim().length == 0){
			$(input).css('border','1px solid red');
			flag = 1;
		}else{//retornar el estilo a lo normal
			$(input).css('border','0px none rgb(51, 51, 51)');
		}
	});
	if(idDiv == 'div_datosGenerales')
		idForm = 1;
	else if(idDiv == 'div_datosCreditos')
		idForm = 2;
	else if(idDiv == 'div_ahorros')
		idForm = 3;
	else if(idDiv == 'div_depositosPlazo')
		idForm = 4;
	else if(idDiv == 'div_fiduciario')
		idForm = 5;
	else if(idDiv == 'div_hipotecaria')
		idForm = 6;
	else if(idDiv == 'div_prendaria')
		idForm = 7;
	else if(idDiv == 'div_remesas')
		idForm = 8;	
	//obtener los id y sus valores al ser almacenados en la base
	if(flag == 0){//todos los input son validos
		jsonText = '{"idFormulario":"'+idForm+'",';
		//recorrido de los input
		$.each($('#'+idDiv+' input[type!="button"]'), function(index, input){
			jsonText += '"'+input.id+'":"'+input.value+'",';
			//console.log(index + ")Id:"+input.id+", VALUE: " + input.value);
		});
		//recorrido de los combo box
		$.each($('#'+idDiv+' select'), function(index, select){
			jsonText += '"'+select.id+'":"'+select.value+'",';
			//console.log(index + ")Id:"+select.id+", VALUE: " + select.value);
		});
		jsonText = jsonText.substr(0,jsonText.length-1);
		jsonText += '}';
		//console.log(jsonText);
		//almacenar en la base de datos
		var db = app.webdb.db;
		var insert = "INSERT INTO STORAGE(FORM,FORM_RESPONSE,DATE_CREATED,ID_DIV,CUSTOMER_REQUESTS) VALUES(?,?,strftime('%Y-%m-%d','now','localtime'),?,?)";
		//llenar el objeto cliente.
		if(idDiv == 'div_datosGenerales'){
			db.transaction(function(tx){
				tx.executeSql("SELECT ID_CAP_CUSTOMER FROM CAP_CUSTOMER WHERE TYPE_IDENTITY = ? AND IDENTITY = ?",[$('#cb_tipoIdentificacion').find('option:selected').val(),$('#txt_noIdentidad').val()],
					function(tx,results){
						var len = results.rows.length;
						if(len != 0){//update cliente
							var updateCap = "UPDATE CAP_CUSTOMER SET firstname=?,midname=?,lastname1=?,lastname2=?,gender=?,birthday=?,nationality=?,ocupation=?,education=? WHERE ID_CAP_CUSTOMER = ?";
							tx.executeSql(updateCap,[$('#txt_primerNombre').val(),$('#txt_segundoNombre').val(),$('#txt_primerApellido').val(),$('#txt_segundoApellido').val(),$('#cb_tipoSexo').find('option:selected').val(),$('#txt_fechaNacimiento').val(),$('#txt_nacionalidad').val(),$('#cb_profecion').find('option:selected').val(),$('#cb_nivelEducativo').find('option:selected').val(),clientGlobal.getId()]);
							var updCliente = "UPDATE STORAGE SET FORM_RESPONSE = ?, DATE_UPDATED = strftime('%Y-%m-%d','now','localtime') WHERE CUSTOMER_REQUESTS = ? AND FORM = 1";
							tx.executeSql(updCliente,[jsonText,clientGlobal.getId()],function(tx,results){
								$.each($('#'+idDiv+' img'), function(index, img){
									tx.executeSql("UPDATE FOTOS SET FOTO = ? WHERE ID_FOTO = (SELECT ID_FOTO FROM FOTOS WHERE ID_STORAGE = (SELECT ID FROM STORAGE WHERE CUSTOMER_REQUESTS = ? AND FORM = 1) AND ID_IMG = ?)",[$('#'+img.id+'_hd').val(),clientGlobal.getId(),img.id]);
								});
								alert("La informacion del "+clientGlobal.getNombreCompleto()+" fue modificada, exitosamente.");
							});
						}else{
							//insertar nuevo cliente
							clientGlobal = new Cliente();
							var insCliente = "INSERT INTO cap_customer(firstname,midname,lastname1,lastname2,type_identity,identity,gender,birthday,status,nationality,ocupation,education,active,date_created) ";
							insCliente += "VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,strftime('%Y-%m-%d','now','localtime'))";
							tx.executeSql(insCliente,[$('#txt_primerNombre').val(),$('#txt_segundoNombre').val(),$('#txt_primerApellido').val(),$('#txt_segundoApellido').val(),$('#cb_tipoIdentificacion').find('option:selected').val(),$('#txt_noIdentidad').val(),$('#cb_tipoSexo').find('option:selected').val(),$('#txt_fechaNacimiento').val(),1,$('#txt_nacionalidad').val(),$('#cb_profecion').find('option:selected').val(),$('#cb_nivelEducativo').find('option:selected').val(),1],
								function(tx,results){
									var id = results.insertId;
									console.log("id:"+id);
									clientGlobal.cargarDatos(id);//toma los valores de los input's
									tx.executeSql(insert,['1',jsonText,idDiv,id],
										function(tx, results){//insersion con exito
										var id_storage = results.insertId;
										//recorrido de las imagenes
										$.each($('#'+idDiv+' img'), function(index, img){
											tx.executeSql("INSERT INTO FOTOS(ID_IMG,FOTO,ID_STORAGE) VALUES(?,?,?)",[img.id,$('#'+img.id+'_hd').val(),id_storage]);
										});										
										//------------------------------------
										$('#div_contentMessage').html('El perfil del cliente <h2>'+$('#txt_primerNombre').val()+' '+$('#txt_segundoNombre').val()+' '+$('#txt_primerApellido').val()+' '+$('#txt_segundoApellido').val()+'</h2><br/>ha sido creado exitosamente.');
										//proceso de limpiar el formulario
										$.each($('#'+idDiv+' input[type!="button"]'), function(index, input){
											$(input).val("");
										});
										$.each($('#'+idDiv+' select'), function(index, select){
											$(select).val($(select).children('option:first').val());
											$(select).selectmenu('refresh');
										});
										//--------enviar mensaje de exito-------
										$('#div_subMessage').hide();
										$('#div_sel_producto').show();
										$('#btn_sel_producto').show();
										//-----------llenar los formularios
										$('#txt_aho_noIdentidad').val(clientGlobal.getNoIdentidad());
										$('#txt_desPlazos_noIdentidad').val(clientGlobal.getNoIdentidad());
										$('#txt_cred_noIdentidad').val(clientGlobal.getNoIdentidad());
										$('#txt_fidu_noIdentidad').val(clientGlobal.getNoIdentidad());
										$('#txt_hipo_noIdentidad').val(clientGlobal.getNoIdentidad());
										$('#txt_pren_noIdentidad').val(clientGlobal.getNoIdentidad());
										
										$('#txt_aho_nombre').val(clientGlobal.getNombreCompleto());
										$('#txt_desPlazos_nombre').val(clientGlobal.getNombreCompleto());
										$('#txt_cred_nombre').val(clientGlobal.getNombreCompleto());
										$('#txt_fidu_nombre').val(clientGlobal.getNombreCompleto());
										$('#txt_hipo_nombre').val(clientGlobal.getNombreCompleto());
										$('#txt_pren_nombre').val(clientGlobal.getNombreCompleto());
										
										$('#txt_aho_codCliente').val(clientGlobal.getId());
										$('#txt_desPlazos_codCliente').val(clientGlobal.getId());
										$('#txt_cred_codCliente').val(clientGlobal.getId());
										$('#txt_fidu_codCliente').val(clientGlobal.getId());
										$('#txt_hipo_codCliente').val(clientGlobal.getId());
										$('#txt_pren_codCliente').val(clientGlobal.getId());
										
										$('#txt_fac_nombre').val(clientGlobal.getNombreCompleto());
										$('#txt_fac_identidad').val(clientGlobal.getNoIdentidad());
										$('#txt_fac_usuario').val(userLoginGlobal.getNombre());
										$('#txt_fac_fecha').val(formatDate(new Date()))
										
										$('#mt_patrimonio').html('0');
										irOpcion('msgExitos');
									},app.webdb.onError);
								}//fin result
							);
						}
					}//fin tx,results
				);
			},app.webdb.onError);
		}else{//else de div_datosGenerales
			db.transaction(function(tx){
				insert = "INSERT INTO STORAGE(FORM,FORM_PROD,FORM_RESPONSE,DATE_CREATED,ID_DIV,CUSTOMER_REQUESTS) VALUES(?,?,?,strftime('%Y-%m-%d','now','localtime'),?,?)";
				//OBTENEMOS producto de acuerdo al formulario
			 	var idProd = 0;
			 	var combo;
			 	if(idForm == 2 || idForm == 5 || idForm == 6 || idForm == 7){
			 		combo = $("#cb_cred_producto").find("option:selected");
			 		idProd = combo.val();
			 	} else if(idForm==3){
			 		combo = $("#cb_aho_producto").find("option:selected");
			 		idProd = combo.val();
			 	} else if(idForm==4){
			 		combo = $("#cb_desPlazos_producto").find("option:selected");
			 		idProd = combo.val();
			 	} else if(idForm==8){
			 		idProd = 13;
			 	}
				tx.executeSql(insert,[idForm,idProd,jsonText,idDiv,clientGlobal.getId()],function(tx, results){
					var id_storage = results.insertId;
					//recorrido de las imagenes
					$.each($('#'+idDiv+' img'), function(index, img){
						tx.executeSql("INSERT INTO FOTOS(ID_IMG,FOTO,ID_STORAGE) VALUES(?,?,?)",[img.id,$('#'+img.id+'_hd').val(),id_storage]);
					});
				});
			},app.webdb.onError,
			function(){//insersion con exito
				//proceso de limpiar el formulario
				$.each($('#'+idDiv+' input[type!="button"]'), function(index, input){
					//no limpiar el encabezado del cliente en cada form
					if(input.id == 'txt_aho_noIdentidad' || input.id == 'txt_desPlazos_noIdentidad' || input.id == 'txt_cred_noIdentidad' || 
							input.id == 'txt_fidu_noIdentidad' || input.id == 'txt_hipo_noIdentidad' || input.id == 'txt_pren_noIdentidad' || 
							input.id == 'txt_aho_nombre' || input.id == 'txt_desPlazos_nombre' || input.id == 'txt_cred_nombre' || 
							input.id == 'txt_fidu_nombre' || input.id == 'txt_hipo_nombre' || input.id == 'txt_pren_nombre' || 
							input.id == 'txt_aho_codCliente' || input.id == 'txt_desPlazos_codCliente' || input.id == 'txt_cred_codCliente' || 
							input.id == 'txt_fidu_codCliente' || input.id == 'txt_hipo_codCliente' || input.id == 'txt_pren_codCliente' ||
							input.id == 'txt_rem_noIdentidad' || input.id == 'txt_rem_nombre' || input.id == 'txt_rem_codCliente')
						console.log('nada pasa');
					else
						$(input).val("");
				});
				$.each($('#'+idDiv+' select'), function(index, select){
					$(select).val($(select).children('option:first').val());
					$(select).selectmenu('refresh');
				});
				alert("Formulario almacenado con exito.");
			});
		}//fin else
	}else{
		alert('Deben llenarse los campos marcados en ROJO.');
	}
}

// Funciones para Evaluación Financiera
function evaluacionFinanciera()
{
	//Cargamos la informacion inicial
	cargarInformacion();
	//hacemos los calculos necesarios
	calculosBalance();
	calculosAnalisisCuota();
	calculoIndicadores();
	calculoCrecimiento();
	// para el Balance General
	$('#txt_bal_cajasyBancos, #txt_bal_cuentasxCobrar, #txt_bal_inventario, #txt_bal_invagro, #txt_bal_cuentasxPagar, #txt_bal_proveedores').on('blur',function(){
		calculosBalance();
		calculosAnalisisCuota();
		calculoIndicadores();
		calculoCrecimiento();
	});
	
	
	// para el Estado de resultados
	$('#txt_res_ventaContadoBueno, #txt_res_ventaContadoRegular , #txt_res_ventaContadoMalo, #txt_res_ventaCreditoBueno, #txt_res_ventaCreditoRegular, #txt_res_ventaCreditoMalo').on('blur',function(){
		calculosEstadosFin();
		calculosAnalisisCuota();
		calculoIndicadores();
		calculoCrecimiento();
	});
	
	$('#txt_res_salarios, #txt_res_alquiler , #txt_res_serviciosPublicos, #txt_res_alimentacion, #txt_res_educasalud, #txt_res_transotros, #txt_res_otros').on('blur',function(){
		calculosEstadosFin();
		calculosAnalisisCuota();
		calculoIndicadores();
		calculoCrecimiento();
	});
	
	$('#txt_res_pagoints, #txt_res_otrosIngresos , #txt_res_otrosIngresosFam, #txt_res_gastoFamiliar').on('blur',function(){
		calculosEstadosFin();
		calculosAnalisisCuota();
		calculoIndicadores();
		calculoCrecimiento();
	});
	
	$('#slt_res_costoVentas').on('change',function(){
		$('#txt_res_costoVenta').val(parseFloat($(this).val()).toFixed(2) + "%");
		calculosEstadosFin();
		calculosAnalisisCuota();
		calculoIndicadores();
		calculoCrecimiento();
	});
	
	$('#txt_cuo_montoRecomendado').on('blur',function(){
		calculosAnalisisCuota();
		calculoIndicadores();
		calculoCrecimiento();
	});
	
	$("#btnFlujo").click(function () { 
		$.ajax({
			"type": "POST", 
			"async" : "false",
			"url":  "'.$this->createUrl('product/eval_flujo_caja').'", 
			"data" : $("#evalfin-form").serialize(),
			"beforeSend" : function(){
				$("#frmFlujo").html('<div style="text-align:center;">Cargando Información...</div>');
			},
			"success": function(data){
				$("#dlgFlujoCaja").popup( "reposition", {x:266, y:2400} );
				$("#frmFlujo").html(data);
			},
		});
	});
}
/*
function cargarInformacion(){
	$('#txt_res_costoVenta').val(eval($('#slt_res_costoVentas').val().length==0?0:parseFloat($('#slt_res_costoVentas').val())));
	//Cargamos la información del Patrimonio del Cliente
	$('#txt_bal_patrimonio').val(parseFloat($('#mt_patrimonio').html()).toFixed(2));
	
	//Cargamos la información del credito que solicita
	$('#txt_cuo_montoSolicitado').val(eval($('#txt_cred_montoSolic').val().length==0?0:parseFloat($('#txt_cred_montoSolic').val()).toFixed(2)));
	$('#txt_cuo_plazo').val($('#txt_cred_plazo').val());
	$('#txt_cuo_frecuencia').val($('#txt_cred_nCuotas').val());
	$('#txt_cuo_interes').val($('#txt_cred_tasaInteres').val());
}

function calculosBalance() {
	//Calculamos Activos
	var val1 = $('#txt_bal_cajasyBancos').val()==""?0:$('#txt_bal_cajasyBancos').val();
	var val2 = $('#txt_bal_cuentasxCobrar').val()==""?0:$('#txt_bal_cuentasxCobrar').val();
	var val3 = $('#txt_bal_inventario').val()==""?0:$('#txt_bal_inventario').val();
	var val4 = $('#txt_bal_invagro').val()==""?0:$('#txt_bal_invagro').val();
	
	var circulante = parseFloat(val1) + 
			   parseFloat(val2) + 
			   parseFloat(val3) + 
			   parseFloat(val4);
	
	$('#txt_bal_activoCirculante').val(circulante.toFixed(2));

	var patrimonio = parseFloat($('#txt_bal_patrimonio').val());
	var activos = circulante + patrimonio
	
	$('#txt_bal_activos').val(activos.toFixed(2));
	
	//Calculamos Pasivos
	var val1 = $('#txt_bal_cuentasxPagar').val()==""?0:$('#txt_bal_cuentasxPagar').val();
	var val2 = $('#txt_bal_proveedores').val()==""?0:$('#txt_bal_proveedores').val();
	var pasivos = parseFloat(val1) + parseFloat(val2);
	$('#txt_bal_pasivos').val(pasivos.toFixed(2));
	
	
	//Calculamos Capital
	var capital = activos-pasivos;
	$('#txt_bal_capital').val(capital.toFixed(2));
	
	//Calculamos el Total
	$('#txt_bal_total').val((pasivos + capital).toFixed(2));
}

function calculosEstadosFin() {
	//la venta al contado
	var c1 = $('#txt_res_ventaContadoBueno').val()==""?0:$('#txt_res_ventaContadoBueno').val();
	var c2 = $('#txt_res_ventaContadoRegular').val()==""?0:$('#txt_res_ventaContadoRegular').val();
	var c3 = $('#txt_res_ventaContadoMalo').val()==""?0:$('#txt_res_ventaContadoMalo').val();
	var contado = (parseFloat(c1) + parseFloat(c2) + parseFloat(c3))/3;
	//la venta al credito
	var v1 = $('#txt_res_ventaCreditoBueno').val()==""?0:$('#txt_res_ventaCreditoBueno').val();
	var v2 = $('#txt_res_ventaCreditoRegular').val()==""?0:$('#txt_res_ventaCreditoRegular').val();
	var v3 = $('#txt_res_ventaCreditoMalo').val()==""?0:$('#txt_res_ventaCreditoMalo').val();
	var credito = (parseFloat(v1) + parseFloat(v2) + parseFloat(v3))/3;
	
	$('#txt_res_sumaVentaContado').val(contado.toFixed(2));
	$('#txt_res_sumaVentaCredito').val(credito.toFixed(2));
	var sumatotal = contado + credito;
	$('#txt_res_sumaVenta').val(sumatotal.toFixed(2));
	
	//calculamos costo de venta
	var costoventa = sumatotal * (parseFloat($('#slt_res_costoVentas').val())/100);
	$('#txt_res_sumaCostoVenta').val(costoventa.toFixed(2));
	var utilidad = sumatotal-costoventa;
	$('#txt_res_utilidad').val(utilidad.toFixed(2));
	
	//Sacamos la suma de los gastos fijos
	var g1 = $('#txt_res_salarios').val()==""?0:$('#txt_res_salarios').val();
	var g2 = $('#txt_res_alquiler').val()==""?0:$('#txt_res_alquiler').val();
	var g3 = $('#txt_res_serviciosPublicos').val()==""?0:$('#txt_res_serviciosPublicos').val();
	var g4 = $('#txt_res_alimentacion').val()==""?0:$('#txt_res_alimentacion').val();
	var g5 = $('#txt_res_educasalud').val()==""?0:$('#txt_res_educasalud').val();
	var g6 = $('#txt_res_transotros').val()==""?0:$('#txt_res_transotros').val();
	var g7 = $('#txt_res_otros').val()==""?0:$('#txt_res_otros').val();
	var gastosfijos = parseFloat(g1) + parseFloat(g2) + parseFloat(g3) + parseFloat(g4) + parseFloat(g5) + parseFloat(g6) + parseFloat(g7);
	
	$('#txt_res_sumaGastos').val(gastosfijos.toFixed(2));
	
	//Calculamos la utilidad neta
	var utilidadNeta = utilidad-gastosfijos;
	$('#txt_res_utilidadNeta').val(utilidadNeta.toFixed(2)).formatCurrency();
	
	//Calculamos la Disponibilidad Real
	var obligneg = $('#txt_res_pagoints').val()==""?0:$('#txt_res_pagoints').val();
	var disponibilidad = utilidadNeta - parseFloat(obligneg);
	
	$('#txt_res_disponibilidad').val(disponibilidad.toFixed(2)).formatCurrency();
	
	//Calculamos la Disponibilidad del Cliente
	var d1 = $('#txt_res_otrosIngresos').val()==""?0:$('#txt_res_otrosIngresos').val();
	var d2 = $('#txt_res_otrosIngresosFam').val()==""?0:$('#txt_res_otrosIngresosFam').val();
	var d3 = $('#txt_res_gastoFamiliar').val()==""?0:$('#txt_res_gastoFamiliar').val();
	
	var dispcliente = disponibilidad + parseFloat(d1) + parseFloat(d2) - parseFloat(d3);
	
	$('#txt_res_disponibilidadCliente').val(dispcliente.toFixed(2)).formatCurrency();
}

function calculosAnalisisCuota() {
		var cal1 = parseFloat(eval($('#txt_cuo_montoRecomendado').val()==""?0:$('#txt_cuo_montoRecomendado').val()));
		var cal2 = parseFloat(eval($('#txt_cuo_plazo').val()==""?0:$('#txt_cuo_plazo').val()));
		var cal3 = parseFloat(eval($('#txt_cuo_frecuencia').val()==""?0:$('#txt_cuo_frecuencia').val()));
		var cal4 = parseFloat(eval($('#txt_cuo_interes').val()==""?0:$('#txt_cuo_interes').val()))/100;
		var cuota = (cal1*(cal4)/12*cal2/cal3)+cal1/cal3
		
		$('#txt_cuo_cuotaRecomendada').val(eval(isNaN(cuota)?0:cuota.toFixed(2))).formatCurrency();
}

function calculoIndicadores() {
	var d1 = $('#txt_res_utilidad').val()==""?0:$('#txt_res_utilidad').val();
	var d2 = $('#txt_res_sumaVenta').val()==""?0:$('#txt_res_sumaVenta').val();
	var d3 = $('#txt_bal_activoCirculante').val()==""?0:$('#txt_bal_activoCirculante').val();
	var d4 = $('#txt_bal_pasivos').val()==""?0:$('#txt_bal_pasivos').val();
	var d5 = $('#txt_bal_inventario').val()==""?0:$('#txt_bal_inventario').val();
	var d6 = $('#txt_cuo_cuotaRecomendada').val()==""?0:$('#txt_cuo_cuotaRecomendada').val();
	var d7 = $('#txt_res_disponibilidad').val()==""?0:$('#txt_res_disponibilidad').val();
	var d8 = $('#txt_res_disponibilidadCliente').val()==""?0:$('#txt_res_disponibilidadCliente').val();
	
	var rentabilidad = parseFloat(d1) / parseFloat(d2);
	var liquidez = parseFloat(d3) / parseFloat(d4);
	var razonAcida = (parseFloat(d3)-parseFloat(d5))/parseFloat(d4)
	var endeudamiento = (parseFloat(d4) / parseFloat(d3))*100;
	var capitalTrabajo = parseFloat(d3) - parseFloat(d4);
	var pagoNegocio = parseFloat(d7) / parseFloat(d6);
	var pagoCliente = parseFloat(d8) / parseFloat(d6);
	
	if(isNaN(rentabilidad)) {
		rentabilidad = 0;
	}
	if(isNaN(liquidez)) {
		liquidez = 0;
	}
	if(isNaN(razonAcida)) {
		razonAcida = 0;
	}
	if(isNaN(endeudamiento)) {
		endeudamiento = 0;
	}
	if(isNaN(capitalTrabajo)) {
		capitalTrabajo = 0;
	}
	if(isNaN(pagoNegocio)) {
		pagoNegocio = 0;
	}
	if(isNaN(pagoCliente)) {
		pagoCliente = 0;
	}
	
	$('#txt_efind_renta').val(rentabilidad.toFixed(2)).formatCurrency();
	$('#txt_efind_liquid').val(liquidez.toFixed(2)).formatCurrency();
	$('#txt_efind_razonAcida').val(razonAcida.toFixed(2)).formatCurrency();
	$('#txt_efind_endeudamiento').val(endeudamiento.toFixed(2)).formatCurrency();
	$('#txt_efind_captrabajo').val(capitalTrabajo.toFixed(2)).formatCurrency();
	$('#txt_efind_pagNeg').val(pagoNegocio.toFixed(2)).formatCurrency();
	$('#txt_efind_pagCli').val(pagoCliente.toFixed(2)).formatCurrency();
	
	if(pagoNegocio < 2 && pagoNegocio > 0){
		$('#lblConNeg').css({'color':'red'});
		$('#lblConNeg').html("Indicador fuera del limete establecido");
	} else {
		$('#lblConNeg').css({'color':'black'});
		$('#lblConNeg').html("");
	}
	
	if(pagoCliente < 2 && pagoCliente > 0){
		$('#lblConCli').css({'color':'red'});
		$('#lblConCli').html("Indicador fuera del limete establecido");
	} else {
		$('#lblConCli').css({'color':'black'});
		$('#lblConCli').html("");
	}
}

function calculoCrecimiento() {
	$('#t_activos').html($('#txt_bal_activos').val()).formatCurrency();
	$('#t_pasivos').html($('#txt_bal_pasivos').val()).formatCurrency();
	$('#t_capital').html($('#txt_bal_capital').val()).formatCurrency();
	$('#t_inventario').html($('#txt_bal_inventario').val()).formatCurrency();
	$('#t_utilidad').html($('#txt_res_utilidadNeta').val()).formatCurrency();
	
	
}
*/

function cargarInformacion(){
	$('#txt_res_costoVenta').val("set", eval($('#txt_res_costoVenta').autoNumeric("get").length==0?0:parseFloat($('#txt_res_costoVenta').autoNumeric("get"))));
	
	//Cargamos la información del Patrimonio del Cliente
	$('#txt_bal_patrimonio').autoNumeric("set", $('#mt_patrimonio').html());
	
	//Cargamos la información del credito que solicita
	$('#txt_cuo_montoSolicitado').autoNumeric("set", eval($('#txt_cred_montoSolic').autoNumeric("get").length==0?0:parseFloat($('#txt_cred_montoSolic').autoNumeric("get"))));
	$('#txt_cuo_plazo').val($('#txt_cred_plazo').val());
	$('#txt_cuo_frecuencia').val($('#txt_cred_nCuotas').val());
	$('#txt_cuo_interes').val($('#txt_cred_tasaInteres').val());
}

function calculosBalance() {
	//Calculamos Activos
	var val1 = eval($('#txt_bal_cajasyBancos').autoNumeric("get").length==0?0:$('#txt_bal_cajasyBancos').autoNumeric("get"));
	var val2 = eval($('#txt_bal_cuentasxCobrar').autoNumeric("get").length==0?0:$('#txt_bal_cuentasxCobrar').autoNumeric("get"));
	var val3 = eval($('#txt_bal_inventario').autoNumeric("get").length==0?0:$('#txt_bal_inventario').autoNumeric("get"));
	var val4 = eval($('#txt_bal_invagro').autoNumeric("get").length==0?0:$('#txt_bal_invagro').autoNumeric("get"));
	
	var circulante = val1 + val2 + val3 + val4;
	
	$('#txt_bal_activoCirculante').autoNumeric("set", circulante);

	var patrimonio = parseFloat($('#txt_bal_patrimonio').autoNumeric("get"));
	var activos = circulante + patrimonio
	
	$('#txt_bal_activos').autoNumeric("set", activos);
	
	//Calculamos Pasivos
	var val1 = eval($('#txt_bal_cuentasxPagar').autoNumeric("get").length==0?0:$('#txt_bal_cuentasxPagar').autoNumeric("get"));
	var val2 = eval($('#txt_bal_proveedores').autoNumeric("get").length==0?0:$('#txt_bal_proveedores').autoNumeric("get"));
	var pasivos = val1 + val2;
	$('#txt_bal_pasivos').autoNumeric("set", pasivos);
	
	
	//Calculamos Capital
	var capital = activos-pasivos;
	$('#txt_bal_capital').autoNumeric("set", capital);
	
	//Calculamos el Total
	$('#txt_bal_total').autoNumeric("set", (pasivos + capital));
}

function calculosEstadosFin() {
	//la venta al contado
	var c1 = eval($('#txt_res_ventaContadoBueno').autoNumeric("get").length==0?0:$('#txt_res_ventaContadoBueno').autoNumeric("get"));
	var c2 = eval($('#txt_res_ventaContadoRegular').autoNumeric("get").length==0?0:$('#txt_res_ventaContadoRegular').autoNumeric("get"));
	var c3 = eval($('#txt_res_ventaContadoMalo').autoNumeric("get").length==0?0:$('#txt_res_ventaContadoMalo').autoNumeric("get"));
	var contado = (c1 + c2 + c3)/3;
	//la venta al credito
	var v1 = eval($('#txt_res_ventaCreditoBueno').autoNumeric("get").length==0?0:$('#txt_res_ventaCreditoBueno').autoNumeric("get"));
	var v2 = eval($('#txt_res_ventaCreditoRegular').autoNumeric("get").length==0?0:$('#txt_res_ventaCreditoRegular').autoNumeric("get"));
	var v3 = eval($('#txt_res_ventaCreditoMalo').autoNumeric("get").length==0?0:$('#txt_res_ventaCreditoMalo').autoNumeric("get"));
	var credito = (v1 + v2 + v3)/3;
	
	$('#txt_res_sumaVentaContado').autoNumeric("set", contado);
	$('#txt_res_sumaVentaCredito').autoNumeric("set", credito);
	
	var sumatotal = contado + credito;
	$('#txt_res_sumaVenta').autoNumeric("set", sumatotal);
	
	//calculamos costo de venta
	var costoventa = sumatotal * (parseFloat($("#slt_res_costoVentas option:selected").data("value"))/100);
	$('#txt_res_sumaCostoVenta').autoNumeric("set", costoventa);
	
	var utilidad = sumatotal-costoventa;
	$('#txt_res_utilidad').autoNumeric("set", utilidad);
	
	//Sacamos la suma de los gastos fijos
	var g1 = eval($('#txt_res_salarios').autoNumeric("get").length==0?0:$('#txt_res_salarios').autoNumeric("get"));
	var g2 = eval($('#txt_res_alquiler').autoNumeric("get").length==0?0:$('#txt_res_alquiler').autoNumeric("get"));
	var g3 = eval($('#txt_res_serviciosPublicos').autoNumeric("get").length==0?0:$('#txt_res_serviciosPublicos').autoNumeric("get"));
	var g4 = eval($('#txt_res_alimentacion').autoNumeric("get").length==0?0:$('#txt_res_alimentacion').autoNumeric("get"));
	var g5 = eval($('#txt_res_educasalud').autoNumeric("get").length==0?0:$('#txt_res_educasalud').autoNumeric("get"));
	var g6 = eval($('#txt_res_transotros').autoNumeric("get").length==0?0:$('#txt_res_transotros').autoNumeric("get"));
	var g7 = eval($('#txt_res_otros').autoNumeric("get").length==0?0:$('#txt_res_otros').autoNumeric("get"));
	var gastosfijos = g1 + g2 + g3 + g4 + g5 + g6 + g7;
	
	$('#txt_res_sumaGastos').autoNumeric("set", gastosfijos);
	
	//Calculamos la utilidad neta
	var utilidadNeta = utilidad-gastosfijos;
	$('#txt_res_utilidadNeta').autoNumeric("set", utilidadNeta);
	
	//Calculamos la Disponibilidad Real
	var obligneg = eval($('#txt_res_pagoints').autoNumeric("get").length==0?0:$('#txt_res_pagoints').autoNumeric("get"));
	var disponibilidad = utilidadNeta - obligneg;
	
	$('#txt_res_disponibilidad').autoNumeric("set", disponibilidad);
	
	//Calculamos la Disponibilidad del Cliente
	var d1 = eval($('#txt_res_otrosIngresos').autoNumeric("get").length==0?0:$('#txt_res_otrosIngresos').autoNumeric("get"));
	var d2 = eval($('#txt_res_otrosIngresosFam').autoNumeric("get").length==0?0:$('#txt_res_otrosIngresosFam').autoNumeric("get"));
	var d3 = eval($('#txt_res_gastoFamiliar').autoNumeric("get").length==0?0:$('#txt_res_gastoFamiliar').autoNumeric("get"));
	
	var dispcliente = disponibilidad + d1 + d2 - d3;
	
	$('#txt_res_disponibilidadCliente').autoNumeric("set", dispcliente);
	
	//para los campos Anual
	
	$("#txt_res_sumaVenta_anual").autoNumeric("set", (parseFloat(eval($("#txt_res_sumaVenta").autoNumeric("get").length==0?0:$("#txt_res_sumaVenta").autoNumeric("get")))*12));
	$("#txt_res_sumaVentaContado_anual").autoNumeric("set", (parseFloat(eval($("#txt_res_sumaVentaContado").autoNumeric("get").length==0?0:$("#txt_res_sumaVentaContado").autoNumeric("get")))*12));
	$("#txt_res_sumaVentaCredito_anual").autoNumeric("set", (parseFloat(eval($("#txt_res_sumaVentaCredito").autoNumeric("get").length==0?0:$("#txt_res_sumaVentaCredito").autoNumeric("get")))*12));
	$("#txt_res_sumaCostoVenta_anual").autoNumeric("set", (parseFloat(eval($("#txt_res_sumaCostoVenta").autoNumeric("get").length==0?0:$("#txt_res_sumaCostoVenta").autoNumeric("get")))*12));
	$("#txt_res_utilidad_anual").autoNumeric("set", (parseFloat(eval($("#txt_res_utilidad").autoNumeric("get").length==0?0:$("#txt_res_utilidad").autoNumeric("get")))*12));
	$("#txt_res_sumaGastos_anual").autoNumeric("set", (parseFloat(eval($("#txt_res_sumaGastos").autoNumeric("get").length==0?0:$("#txt_res_sumaGastos").autoNumeric("get")))*12));
	$("#txt_res_salarios_anual").autoNumeric("set", (parseFloat(eval($("#txt_res_salarios").autoNumeric("get").length==0?0:$("#txt_res_salarios").autoNumeric("get")))*12));
	$("#txt_res_alquiler_anual").autoNumeric("set", (parseFloat(eval($("#txt_res_alquiler").autoNumeric("get").length==0?0:$("#txt_res_alquiler").autoNumeric("get")))*12));
	$("#txt_res_serviciosPublicos_anual").autoNumeric("set", (parseFloat(eval($("#txt_res_serviciosPublicos").autoNumeric("get").length==0?0:$("#txt_res_serviciosPublicos").autoNumeric("get")))*12));
	$("#txt_res_alimentacion_anual").autoNumeric("set", (parseFloat(eval($("#txt_res_alimentacion").autoNumeric("get").length==0?0:$("#txt_res_alimentacion").autoNumeric("get")))*12));
	$("#txt_res_educasalud_anual").autoNumeric("set", (parseFloat(eval($("#txt_res_educasalud").autoNumeric("get").length==0?0:$("#txt_res_educasalud").autoNumeric("get")))*12));
	$("#txt_res_transotros_anual").autoNumeric("set", (parseFloat(eval($("#txt_res_transotros").autoNumeric("get").length==0?0:$("#txt_res_transotros").autoNumeric("get")))*12));
	$("#txt_res_otros_anual").autoNumeric("set", (parseFloat(eval($("#txt_res_otros").autoNumeric("get").length==0?0:$("#txt_res_otros").autoNumeric("get")))*12));
	$("#txt_res_utilidadNeta_anual").autoNumeric("set", (parseFloat(eval($("#txt_res_utilidadNeta").autoNumeric("get").length==0?0:$("#txt_res_utilidadNeta").autoNumeric("get")))*12));
	$("#txt_res_pagoints_anual").autoNumeric("set", (parseFloat(eval($("#txt_res_pagoints").autoNumeric("get").length==0?0:$("#txt_res_pagoints").autoNumeric("get")))*12));
	$("#txt_res_disponibilidad_anual").autoNumeric("set", (parseFloat(eval($("#txt_res_disponibilidad").autoNumeric("get").length==0?0:$("#txt_res_disponibilidad").autoNumeric("get")))*12));
	$("#txt_res_otrosIngresos_anual").autoNumeric("set", (parseFloat(eval($("#txt_res_otrosIngresos").autoNumeric("get").length==0?0:$("#txt_res_otrosIngresos").autoNumeric("get")))*12));
	$("#txt_res_otrosIngresosFam_anual").autoNumeric("set", (parseFloat(eval($("#txt_res_otrosIngresosFam").autoNumeric("get").length==0?0:$("#txt_res_otrosIngresosFam").autoNumeric("get")))*12));
	$("#txt_res_gastoFamiliar_anual").autoNumeric("set", (parseFloat(eval($("#txt_res_gastoFamiliar").autoNumeric("get").length==0?0:$("#txt_res_gastoFamiliar").autoNumeric("get")))*12));
	$("#txt_res_disponibilidadCliente_anual").autoNumeric("set", (parseFloat(eval($("#txt_res_disponibilidadCliente").autoNumeric("get").length==0?0:$("#txt_res_disponibilidadCliente").autoNumeric("get")))*12));
}

function calculosAnalisisCuota() {
		var cal1 = eval($('#txt_cuo_montoRecomendado').autoNumeric("get").length==0?0:$('#txt_cuo_montoRecomendado').autoNumeric("get"));
		var cal2 = eval($('#txt_cuo_plazo').val().length==0?0:$('#txt_cuo_plazo').val());
		var cal3 = eval($('#txt_cuo_frecuencia').val().length==0?0:$('#txt_cuo_frecuencia').val());
		var cal4 = eval($('#txt_cuo_interes').autoNumeric("get").length==0?0:$('#txt_cuo_interes').autoNumeric("get"))/100;
		
		var cuota = (cal1*(cal4)/12*cal2/cal3)+cal1/cal3
		
		$('#txt_cuo_cuotaRecomendada').autoNumeric("set", eval(isNaN(cuota)?0:cuota));
}

function calculoIndicadores(){
	var d1 = $('#txt_res_utilidad').autoNumeric("get").length==0?0:$('#txt_res_utilidad').autoNumeric("get");
	var d2 = $('#txt_res_sumaVenta').autoNumeric("get").length==0?0:$('#txt_res_sumaVenta').autoNumeric("get");
	var d3 = $('#txt_bal_activoCirculante').autoNumeric("get").length==0?0:$('#txt_bal_activoCirculante').autoNumeric("get");
	var d4 = $('#txt_bal_pasivos').autoNumeric("get").length==0?0:$('#txt_bal_pasivos').autoNumeric("get");
	var d5 = $('#txt_bal_inventario').autoNumeric("get").length==0?0:$('#txt_bal_inventario').autoNumeric("get");
	var d6 = $('#txt_cuo_cuotaRecomendada').autoNumeric("get").length==0?0:$('#txt_cuo_cuotaRecomendada').autoNumeric("get");
	var d7 = $('#txt_res_disponibilidad').autoNumeric("get").length==0?0:$('#txt_res_disponibilidad').autoNumeric("get");
	var d8 = $('#txt_res_disponibilidadCliente').autoNumeric("get").length==0?0:$('#txt_res_disponibilidadCliente').autoNumeric("get");
	
	var rentabilidad = (d1 / d2)*100;
	var liquidez = d3 / d4;
	var razonAcida = (d3-d5)/d4;
	var endeudamiento = (d4 / d3)*100;
	var capitalTrabajo = d3 - d4;
	var pagoNegocio = d7 / d6;
	var pagoCliente = d8 / d6;
	
	$('#txt_efind_ind43').val(rentabilidad.toFixed(2) + '%');
	$('#txt_efind_ind44').val(liquidez.toFixed(2));
	$('#txt_efind_ind45').val(razonAcida.toFixed(2));
	$('#txt_efind_ind46').val(endeudamiento.toFixed(2) + '%');
	$('#txt_efind_ind47').autoNumeric("set", capitalTrabajo);
	$('#txt_efind_ind48').val(pagoNegocio.toFixed(2));
	$('#txt_efind_ind49').val(pagoCliente.toFixed(2));
	
	if(!(rentabilidad >= eval($("#txt_efin_ind_val43").val()))) {
		$('#txt_efind_ind43').css({'background-color':'red'});
	} else {
		$('#txt_efind_ind43').css({'background-color':'white'});
	}
	
	if(!(liquidez >= eval($("#txt_efin_ind_val44").val()))) {
		$('#txt_efind_ind44').css({'background-color':'red'});
	} else {
		$('#txt_efind_ind44').css({'background-color':'white'});
	}
	
	if(!(razonAcida >= eval($("#txt_efin_ind_val45").val()))) {
		$('#txt_efind_ind45').css({'background-color':'red'});
	} else {
		$('#txt_efind_ind45').css({'background-color':'white'});
	}
	
	if(!(endeudamiento <= eval($("#txt_efin_ind_val46").val()))) {
		$('#txt_efind_ind46').css({'background-color':'red'});
	} else {
		$('#txt_efind_ind46').css({'background-color':'white'});
	}
	
	if(!(pagoNegocio >= eval($("#txt_efin_ind_val48").val()))) {
		$('#txt_efind_ind48').css({'background-color':'red'});
	} else {
		$('#txt_efind_ind48').css({'background-color':'white'});
	}
	
	if(!(pagoCliente >= eval($("#txt_efin_ind_val49").val()))) {
		$('#txt_efind_ind49').css({'background-color':'red'});
	} else {
		$('#txt_efind_ind49').css({'background-color':'white'});
	}
	
}

function calculoCrecimiento() {
	$('#t_activos').autoNumeric("set", $('#txt_bal_activos').autoNumeric("get"));
	$('#t_pasivos').autoNumeric("set", $('#txt_bal_pasivos').autoNumeric("get"));
	$('#t_capital').autoNumeric("set", $('#txt_bal_capital').autoNumeric("get"));
	$('#t_inventario').autoNumeric("set", eval(parseFloat($('#txt_bal_inventario').autoNumeric("get")) + parseFloat($("#txt_bal_invagro").autoNumeric("get"))));
	$('#t_utilidad').autoNumeric("set", $('#txt_res_utilidadNeta').autoNumeric("get"));
	
	$('#v_activos').autoNumeric("set", eval($('#t_activos').autoNumeric("get") - parseFloat($("#txt_crec_activos_pasado").autoNumeric("get"))));
	$('#v_pasivos').autoNumeric("set", eval($('#t_pasivos').autoNumeric("get") - parseFloat($("#txt_crec_pasivos_pasado").autoNumeric("get"))));
	$('#v_capital').autoNumeric("set", eval($('#t_capital').autoNumeric("get") - parseFloat($("#txt_crec_capital_pasado").autoNumeric("get"))));
	$('#v_inventario').autoNumeric("set", eval($('#t_inventario').autoNumeric("get") - parseFloat($("#txt_crec_inventarios_pasado").autoNumeric("get"))));
	$('#v_utilidad').autoNumeric("set", eval($('#t_utilidad').autoNumeric("get") - parseFloat($("#txt_crec_utilidad_pasado").autoNumeric("get"))));
	
	var r1 = eval(isNaN(($('#v_activos').autoNumeric("get") / parseFloat($("#txt_crec_activos_pasado").autoNumeric("get"))))?0:(parseFloat($('#v_activos').html()) / parseFloat($("#txt_crec_activos_pasado").autoNumeric("get"))));
	var r2 = eval(isNaN(($('#v_pasivos').autoNumeric("get") / parseFloat($("#txt_crec_pasivos_pasado").autoNumeric("get"))))?0:(parseFloat($('#v_pasivos').html()) / parseFloat($("#txt_crec_pasivos_pasado").autoNumeric("get"))));
	var r3 = eval(isNaN(($('#v_capital').autoNumeric("get") / parseFloat($("#txt_crec_capital_pasado").autoNumeric("get"))))?0:(parseFloat($('#v_capital').html()) / parseFloat($("#txt_crec_capital_pasado").autoNumeric("get"))));
	var r4 = eval(isNaN(($('#v_inventario').autoNumeric("get") / parseFloat($("#txt_crec_inventarios_pasado").autoNumeric("get"))))?0:(parseFloat($('#v_inventario').html()) / parseFloat($("#txt_crec_inventarios_pasado").autoNumeric("get"))));
	var r5 = eval(isNaN(($('#v_utilidad').autoNumeric("get") / parseFloat($("#txt_crec_utilidad_pasado").autoNumeric("get"))))?0:(parseFloat($('#v_utilidad').html()) / parseFloat($("#txt_crec_utilidad_pasado").autoNumeric("get"))));
	
	$('#p_activos').html((r1*100).toFixed(2) + '%');
	$('#p_pasivos').html((r2*100).toFixed(2) + '%');
	$('#p_capital').html((r3*100).toFixed(2) + '%');
	$('#p_inventario').html((r4*100).toFixed(2) + '%');
	$('#p_utilidad').html((r5*100).toFixed(2) + '%');
}
// Fin de Funciones