var app = {};
app.webdb = {};
app.hdh = {};
app.webdb.db = null;
var apiUrl = "http://190.4.59.35/frontend/www/index.php/api";
var apiBaseUrl = "http://190.4.59.35/frontend/www/index.php";
//var apiUrl = "http://127.0.0.1/frontend/www/index.php/api";
//var apiBaseUrl = "http://127.0.0.1/frontend/www/index.php";
var inputGlobal1,inputGlobal2; //para almacenar los input actuales 
var clientGlobal;
var userLoginGlobal;
var fechaSincronizacion;//variable donde se almacenara la ultima fecha la cual fue sincronizado
//para saber a que pagina irse o donde esta actualmente;
//1: datos del cliente
var paginaActual = 0;
//variables globales para almacenas los json de las sincronizacion
var jsonPerfilGlobal = '';
var jsonFormulariosGlobal = '';
//--------------------------------------------------------
//Funcion de arranque
//--------------------------------------------------------
app.initialize = function() {
	app.bindEvents();
	app.initFastClick();
};

app.bindEvents = function() {    
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
		//aplicamos mascaras a identidades y telefonos
		$(".format_identidad").mask("0000-0000-00000");
		$(".format_phone").mask("0000-0000");
	});
};

app.initFastClick = function() {
    window.addEventListener('load', function() {
        FastClick.attach(document.body);
    }, false);
};

app.onDeviceReady = function() {
	$.mobile.loading( "show", {
		  textVisible: true,
		  html: "<img style='padding-left:35px' src='css/themes/images/ajax-loader.gif'/>"
	});
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
	$.mobile.loading( "show", {
		  textVisible: true,
		  html: "<img style='padding-left:35px' src='css/themes/images/ajax-loader.gif'/>"
	});
	app.webdb.crear_tablas();
	$.mobile.loading("hide");
};

//--------------------------------------------------------
function log(tarea){
	var db = app.webdb.db;
	db.transaction(function(tx){
		tx.executeSql("INSERT INTO LOGS(TAREA,FECHA) VALUES(?,strftime('%Y-%m-%d %H:%M:%S','now','localtime'))",[tarea]);
	});
}

function isActiveConnection(){
	//return true;
	var networkState = navigator.connection.type;
	var ret;

	if(networkState == Connection.NONE)
		ret = false;
	else
		ret = true;
	return ret;
}

function inicialLogin(){
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
	var db = app.webdb.db;
	// recolecta los valores que inserto el usuario
	var datosUsuario = $("#txt_user").val()
	var datosPassword = $("#txt_pass").val()
	$.mobile.loading( "show", {
		  textVisible: true,
		  html: "<img style='padding-left:35px' src='css/themes/images/ajax-loader.gif'/>"
	});
	if(!isActiveConnection()) {
		$.mobile.loading("hide");
		alert('Para iniciar sesión debe tener conexión activa a Internet');
	} else {
		$.ajax({
			type: "POST",
			dataType: 'jsonp',
			jsonp: "jsoncallback",
			url: apiUrl+ "/login",
			data: ({usuario : datosUsuario,
					password : datosPassword,
					equipo : (typeof device == 'undefined')?'Desktop':device.uuid
			}),
			cache: false,
			dataType: "text",
			timeout: 60000, //3 second timeout
			beforeSend: function(objeto){
				$.mobile.loading( "show", {
					  textVisible: true,
					  html: "<img style='padding-left:35px' src='css/themes/images/ajax-loader.gif'/>"
				});
				console.log("inicia logeo.");
			},
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
					userLoginGlobal.setCompanyName(respuestaServer.companyName);
					userLoginGlobal.setCompanyId(respuestaServer.companyId);
					userLoginGlobal.setCompanyPlace(respuestaServer.companyPlace);
					userLoginGlobal.setNombreCompleto(respuestaServer.fullname);
					//----registrar que el user esta logeado
					db.transaction(function(tx){
						tx.executeSql("UPDATE USERLOGIN SET NOMBRE = ?,PASS = ?,USERID = ?,ROLENAME = ?,COMPANYNAME = ?,COMPANYID = ?,COMPANYPLACE = ?,LOGEADO = 'S',MENSAJE = ?",[$('#txt_user').val(),$('#txt_pass').val(),respuestaServer.userid,respuestaServer.rolename,respuestaServer.companyName,respuestaServer.companyId,respuestaServer.companyPlace,respuestaServer.mensajePortada]);
					});
					//--------------------------------------
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
				if(mensaje == 'timeout') {
					alert('Se agoto el tiempo de espera, imposible conectar con el servidor. (posible falla en la conexion de internet o desconexion del servidor).'); 
				} else {
					alert(mensaje + ": " + otroobj);
				}
			}
		});
	}
}
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

app.hdh.verificarLogin = function(direct) {
	var valid = true;
	if(typeof userLoginGlobal == 'undefined'){
		if(direct == 'undefined')
			return  false; 
		else {
			$.mobile.changePage($('#pag_login'));
		}
	} else {
		if(userLoginGlobal.userid == undefined){
			if(direct == 'undefined')
				return  false; 
			else {
				$.mobile.changePage($('#pag_login'));
			}
		} else {
			return true;
		}
	}
}

function cambiarPagina(idPagina){
	$.mobile.loading( "show", {
		  textVisible: true,
		  html: "<img style='padding-left:35px' src='css/themes/images/ajax-loader.gif'/>"
	});
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
function capturePhoto(imgHtml){
	//return;
	$.mobile.loading( "show", {
		  textVisible: true,
		  html: "<img style='padding-left:35px' src='css/themes/images/ajax-loader.gif'/>"
	});
    navigator.camera.getPicture(
            function(imageData) {
            	$(imgHtml).attr('src','');
            	$(imgHtml).attr('src','data:image/jpeg;base64,' + imageData);
            	$.mobile.loading("hide");
				$('#'+$(imgHtml).attr('id')+'_hd').val(imageData);
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
             correctOrientation: true}
	);
}

function obtenerCoordenadas(input1,input2){
	$.mobile.loading( "show", {
		  text: "Obteniendo Coordenadas",
		  textVisible: true,
		  theme: "a",
		  html: "<img style='padding-left:35px' src='css/themes/images/ajax-loader.gif'/>"
		});
	inputGlobal1 = input1;
	inputGlobal2 = input2;
	navigator.geolocation.getCurrentPosition(onSuccessCoordenadas, onErrorCoordenadas, {timeout: 5000, enableHighAccuracy: true});
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
	switch(error.code) {
		case error.PERMISSION_DENIED:
		  alert("Acceso denegado para la obtención de coordenadas.");
		  break;
		case error.POSITION_UNAVAILABLE:
		  alert("Información de Localizacion no disponible, favor revisar que el sensor GPS esta activo.");
		  break;
		case error.TIMEOUT:
		  alert("El tiempo para obtener las coordenadas se ha agotado.");
		  break;
		case error.UNKNOWN_ERROR:
		  alert("Error desconocido.");
		  break;
		default:
		  alert('Fallo la obtencion de las coordenadas, favor revisar que el sensor GPS esta activo.');
    }
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

function calcularFactMap(valor1, valor2, sutTotal){
	var total = 0;
	if(valor1.length == 0 || valor2.length == 0){
		$(sutTotal).val(0);
	} else {
		$(sutTotal).NumBox('setRaw', (eval(valor1)*eval(valor2)).toFixed(2));
	}
	
	total += eval($('#txt_pren_maqValorTotal1').NumBox('getRaw').length==0?0:$('#txt_pren_maqValorTotal1').NumBox('getRaw'));
	total += eval($('#txt_pren_maqValorTotal2').NumBox('getRaw').length==0?0:$('#txt_pren_maqValorTotal2').NumBox('getRaw'));
	total += eval($('#txt_pren_maqValorTotal3').NumBox('getRaw').length==0?0:$('#txt_pren_maqValorTotal3').NumBox('getRaw'));
	total += eval($('#txt_pren_maqValorTotal4').NumBox('getRaw').length==0?0:$('#txt_pren_maqValorTotal4').NumBox('getRaw'));
	total += eval($('#txt_pren_maqValorTotal5').NumBox('getRaw').length==0?0:$('#txt_pren_maqValorTotal5').NumBox('getRaw'));
	
	$('#txt_pren_maqValorGranTotal').NumBox('setRaw', total);
}

function cambioEstadoPrendario(camboPrendario){
	var selectedOption = $(camboPrendario).find('option:selected');
	if(eval(selectedOption.val()) == 3){
		$('#div_pren_ven').show();
		$('#div_pren_maq').hide();
		$('#div_pren_Ahorro').hide();
		$('#div_pren_maqCapturas').show();
	}else if(eval(selectedOption.val()) == 4){
		$('#div_pren_ven').hide();
		$('#div_pren_maq').show();
		$('#div_pren_Ahorro').hide();
		$('#div_pren_maqCapturas').show();
	}else if(eval(selectedOption.val()) == 6){
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

function sumarTerrenos(){
	var total = 0;
		total += eval($('#txt_terr_cultovoCafe').NumBox('getRaw').length==0?0:$('#txt_terr_cultovoCafe').NumBox('getRaw'));
		total += eval($('#txt_terr_cultivoGranos').NumBox('getRaw').length==0?0:$('#txt_terr_cultivoGranos').NumBox('getRaw'));
		total += eval($('#txt_terr_cultivoPastos').NumBox('getRaw').length==0?0:$('#txt_terr_cultivoPastos').NumBox('getRaw'));
		total += eval($('#txt_terr_cultivoGuamiles').NumBox('getRaw').length==0?0:$('#txt_terr_cultivoGuamiles').NumBox('getRaw'));
		total += eval($('#txt_terr_cultivoHortalizas').NumBox('getRaw').length==0?0:$('#txt_terr_cultivoHortalizas').NumBox('getRaw'));
		total += eval($('#txt_terr_cultivoFrutales').NumBox('getRaw').length==0?0:$('#txt_terr_cultivoFrutales').NumBox('getRaw'));
		total += eval($('#txt_terr_cultivoBosques').NumBox('getRaw').length==0?0:$('#txt_terr_cultivoBosques').NumBox('getRaw'));
		total += eval($('#txt_terr_cultivoLagunas').NumBox('getRaw').length==0?0:$('#txt_terr_cultivoLagunas').NumBox('getRaw'));
		
	$('#txt_terr_total').NumBox('setRaw', total);
}

function sumaTerrenoCasa(){
	var total = 0;
		total += eval($('#txt_terr_cultovoCafeMetros').NumBox('getRaw').length==0?0:$('#txt_terr_cultovoCafeMetros').NumBox('getRaw'));
		total += eval($('#txt_terr_cultivoGranosMetros').NumBox('getRaw').length==0?0:$('#txt_terr_cultivoGranosMetros').NumBox('getRaw'));
		total += eval($('#txt_terr_cultivoPastosMetros').NumBox('getRaw').length==0?0:$('#txt_terr_cultivoPastosMetros').NumBox('getRaw'));
		total += eval($('#txt_terr_cultivoGuamilesMetros').NumBox('getRaw').length==0?0:$('#txt_terr_cultivoGuamilesMetros').NumBox('getRaw'));
		total += eval($('#txt_terr_cultivoHortalizasMetros').NumBox('getRaw').length==0?0:$('#txt_terr_cultivoHortalizasMetros').NumBox('getRaw'));
		total += eval($('#txt_terr_cultivoFrutalesMetros').NumBox('getRaw').length==0?0:$('#txt_terr_cultivoFrutalesMetros').NumBox('getRaw'));
		total += eval($('#txt_terr_cultivoBosquesMetros').NumBox('getRaw').length==0?0:$('#txt_terr_cultivoBosquesMetros').NumBox('getRaw'));
		total += eval($('#txt_terr_cultivoLagunasMetros').NumBox('getRaw').length==0?0:$('#txt_terr_cultivoLagunasMetros').NumBox('getRaw'));
	
		total += eval($('#txt_terr_areaCasa_Norte').NumBox('getRaw').length==0?0:$('#txt_terr_areaCasa_Norte').NumBox('getRaw'));
		total += eval($('#txt_terr_areaCasa_sur').NumBox('getRaw').length==0?0:$('#txt_terr_areaCasa_sur').NumBox('getRaw'));
		total += eval($('#txt_terr_areaCasa_este').NumBox('getRaw').length==0?0:$('#txt_terr_areaCasa_este').NumBox('getRaw'));
		total += eval($('#txt_terr_areaCasa_oeste').NumBox('getRaw').length==0?0:$('#txt_terr_areaCasa_oeste').NumBox('getRaw'));
		total += eval($('#txt_terr_areaCasa_construcion').NumBox('getRaw').length==0?0:$('#txt_terr_areaCasa_construcion').NumBox('getRaw'));
	
	$('#txt_terr_areaCasa_TotalconstrucionMetros').NumBox('setRaw',total);
	$('#txt_terr_areaCasa_Totalconstrucion').NumBox('setRaw', Math.ceil(total/7000));
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
	if(selectedOption.val() != "S"){
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

function sincronizarFormDinamicos(idFormulario){
	var r = confirm("\xbfDesea sincronizar el formulario?");
	var db = app.webdb.db;
	if(r == true){
		$.ajax({
		    type: "POST",
		    dataType: 'jsonp',
		    jsonp: "jsoncallback",
		    url: apiUrl+ "/getForm",
		    data: ({id: idFormulario}),
		    cache: false,
		    dataType: "text",
		    beforeSend: function(objeto){
		    	$.mobile.loading( "show", {
				  text: "Cargando Formulario:"+idFormulario,
				  textVisible: true,
				  theme: "a",
				  html: "<img style='padding-left:35px' src='css/themes/images/ajax-loader.gif'/>"
				});
		    	console.log("Inicia importacion de formulario: "+idFormulario);
			},
		    success: function(datos){
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
					$.mobile.loading("hide");
		    		$('#'+idDiv).html(datos);
					$('#'+idDiv+' div').collapsible();
					$('#'+idDiv+' select').selectmenu();
					$('#'+idDiv+' input[type!="button"]').textinput();
					$('#'+idDiv+' :button').button();
					$("#contentPop").html("Formulario " + idDiv.substring(4) + " sincronizado con exito.");
					$("#popupResult").popup("open");
				}
		    	);
			},
		    error: function(objeto, mensaje, otroobj){
		    	$.mobile.loading("hide");
				$("#contentPop").html("Hubo un problema con la sincronización intente de nuevo.");
				$("#popupResult").popup("open");
		    	console.log("Trono importacion de formulario: "+idFormulario+ ": ");
		    }
		});//fin ajax
	}//fin confirm
}

function sincronizarTablas(categoria) {
	var r = confirm("\xbfDesea sincronizar estas Tablas?");
	var db = app.webdb.db;
	if(r == true){
		$.ajax({
		    type: "POST",
		    dataType: 'json',
		    url: apiUrl+ "/getDataTables",
		    data: ({cat: categoria}),
		    cache: false,
		    beforeSend: function(objeto){
		    	$.mobile.loading( "show", {
				  text: "Cargando Datos de: "+categoria.toUpperCase(),
				  textVisible: true,
				  theme: "a",
				  html: "<img style='padding-left:35px' src='css/themes/images/ajax-loader.gif'/>"
				});
		    	console.log("Inicia importacion de datos de tablas: "+categoria);
			}, success: function(datos){
		    	console.log("finalizo importacion de datos de tablas: "+categoria);
				data = JSON && JSON.parse(d) || $.parseJSON(d);
				if(categoria == "productos"){
					db.transaction(function(tx){
						tx.executeSql("DELETE FROM PRODUCT;",[]);
					
						$.each(data.PRODUCT, function(i, item) {
							tx.executeSql("INSERT INTO PRODUCT (ID2, CATEGORY, COD_PRODUCTO, NAME, ACTIVE, DATE_CREATED, DATE_UPDATED) VALUES(?, ?, ?, ?, ?, ?, ?);",
											  [item.ID2, item.CATEGORY, item.COD_PRODUCTO, item.NAME, item.ACTIVE, item.DATE_CREATED, item.DATE_UPDATED]);							
						});	
						$.each(data.PRODUCT_RATES, function(i, item) {
							tx.executeSql("INSERT INTO PRODUCT_RATES (ID, PRODUCT, TERM, AMOUNT_MIN, AMOUNT_MAX, RATE_MIN, RATE_MAX, PAYMENT, ACTIVE, DATE_CREATED, DATE_UPDATED) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);",
											  [item.ID, item.PRODUCT, item.TERM, item.AMOUNT_MIN, item.AMOUNT_MAX, item.RATE_MIN, item.RATE_MAX, item.PAYMENT, item.ACTIVE, item.DATE_CREATED, item.DATE_UPDATED]);
						});						
					});
				} else if(categoria == "ciiu"){
				
				} else if(categoria == "destino"){
				
				} else if(categoria == "departamento"){
				
				} else if(categoria == "internas") {
				
				}
				
				$.mobile.loading("hide");
				$("#contentPop").html("Datos de " + categoria + " sincronizados con exito.");
				$("#popupResult").popup("open");
		},
		    error: function(objeto, mensaje, otroobj){
		    	$.mobile.loading("hide");
				$("#contentPop").html("Hubo un problema con la sincronización intente de nuevo.");
				$("#popupResult").popup("open");
		    	console.log("Trono importacion de datos de tablas: "+categoria+ ": ");
		    }
		});//fin ajax
	}
}

function obtenerForm(idForm) {
	var form="";
	switch (eval(idForm)) {
	case 2:
		form = 'Credito';
		break;
	case 3:
		form = 'Cuentas de Ahorro';
		break;
	case 4:
		form = 'Depositos a Plazo';
		break;
	case 5:
		form = 'Fiduciaria';
		break;
	case 6:
		form = 'Hipotecaria';
		break;
	case 7:
		form = 'Prendaria';
		break;
	case 8:
		form = 'Remesas';
		break;
	}
	return form;
}

function enviarDatosAWeb() {
	if(!isActiveConnection()){
		alert('Favor revisar que la coneccion a internet este activa.');
	} 
	else {
		var perfiles;
		var formularios;
		var imagenes;
		
		perfiles = true;
		formularios = $('#ssolicitudes').is(':checked');
		imagenes = $('#simagenes').is(':checked');
		getUltimaSincronizacion();
		
		
		var db = app.webdb.db;
		var query = "SELECT ID_CAP_CUSTOMER,AGENCIA,FIRSTNAME,MIDNAME,LASTNAME1,LASTNAME2,TYPE_IDENTITY,IDENTITY,GENDER,strftime('%d/%m/%Y',BIRTHDAY) BIRTHDAY,STATUS,NATIONALITY,OCUPATION,EDUCATION,ACTIVE,strftime('%d/%m/%Y',DATE_CREATED) DATE_CREATED, PATRIMONY FROM CAP_CUSTOMER WHERE DATE_UPDATED > ?";
		var json = "";
		var jsonForm = "";
		var jsonImagenes = "";
		var jsonGarantias = "";
		
		// Enviamos toda la informacion al sistema
		db.transaction(function(tx){
			if(perfiles){
				tx.executeSql(query,[$("#lstdSincro").val()],function(tx,results){
					var len = results.rows.length;
					json = '{"CAP_CUSTOMER":[';
					for(var i=0;i<len;i++){
						var row = results.rows.item(i);
						json += '{"ID_CAP_CUSTOMER":"'+row['ID_CAP_CUSTOMER']+'","AGENCIA":"'+row['AGENCIA']+'","FIRSTNAME":"'+row['FIRSTNAME']+'","MIDNAME":"'+row['MIDNAME']+'","LASTNAME1":"'+row['LASTNAME1']+'","LASTNAME2":"'+row['LASTNAME2']+'","TYPE_IDENTITY":"'+row['TYPE_IDENTITY']+'","IDENTITY":"'+row['IDENTITY']+'","GENDER":"'+row['GENDER']+'",';
						json += '"BIRTHDAY":"'+row['BIRTHDAY']+'","STATUS":"'+row['STATUS']+'","NATIONALITY":"'+row['NATIONALITY']+'","OCUPATION":"'+row['OCUPATION']+'","EDUCATION":"'+row['EDUCATION']+'","ACTIVE":"'+row['ACTIVE']+'","PATRIMONY":"'+row['PATRIMONY']+'","DATE_CREATED":"'+row['DATE_CREATED']+'"},';
					}//fin for
					if(len > 0){
						json = json.substr(0,json.length-1);
					}
					json += ']}';
				});	
			}//fin perfiles
			if(formularios){
				tx.executeSql("SELECT S.ID, C.ID_SERVER, C.FIRSTNAME, C.MIDNAME, C.LASTNAME1, C.LASTNAME2, S.ID_FORM_SERVER, S.FORM_PROD, S.CUSTOMER_REQUESTS,S.FORM,S.FORM_RESPONSE, strftime('%d/%m/%Y',S.DATE_CREATED) DATE_CREATED FROM STORAGE S JOIN CAP_CUSTOMER C ON S.CUSTOMER_REQUESTS = C.ID_CAP_CUSTOMER WHERE S.DATE_UPDATED > ?",[$("#lstdSincro").val()],function(tx,results){
					var len = results.rows.length;
					jsonForm = '{"FORMULARIOS":[';
					for(var j=0;j<len;j++){
						var row = results.rows.item(j);
						jsonForm += '{"ID":"'+row['ID']+'","FIRSTNAME":"'+row['FIRSTNAME']+'","MIDNAME":"'+row['MIDNAME']+'","LASTNAME1":"'+row['LASTNAME1']+'","LASTNAME2":"'+row['LASTNAME2']+'","ID_FORM_SERVER":"'+row['ID_FORM_SERVER']+'","FORM_PROD":"'+row['FORM_PROD']+'","ID_SERVER":"'+row['ID_SERVER']+'","CUSTOMER_REQUESTS":"'+row['CUSTOMER_REQUESTS']+'","DATE_CREATED":"'+row['DATE_CREATED']+'","FORM":"'+row['FORM']+'","FORM_RESPONSE":'+row['FORM_RESPONSE'].replace(new RegExp('\r?\n','g'), '\\r\\n')+'},';
					}//fin for
					if(len > 0){
						jsonForm = jsonForm.substr(0,jsonForm.length-1);
					}
					jsonForm += ']}';
					//console.log(jsonForm);
				});
			}//fin formularios
			if(imagenes){
				var queryImgs = "SELECT C.ID_CAP_CUSTOMER,F.ID_IMG,FOTO FROM FOTOS F JOIN STORAGE S ON F.ID_STORAGE = S.ID JOIN CAP_CUSTOMER C ON S.CUSTOMER_REQUESTS = C.ID_CAP_CUSTOMER WHERE S.DATE_UPDATED > ? ORDER BY C.ID_CAP_CUSTOMER LIMIT 1";
				tx.executeSql(queryImgs,[$("#lstdSincro").val()],function(tx,results){
					var len = results.rows.length;
					jsonImagenes = '{"IMAGENES":[';
					for(var j=0;j<len;j++){
						var row = results.rows.item(j);
						jsonImagenes += '{"CUSTOMER_REQUESTS":"'+row['ID_CAP_CUSTOMER']+'","ID_IMG":"'+row['ID_IMG']+'","FOTO":"'+row['FOTO']+'},';
					}//fin for
					if(len > 0){
						jsonImagenes = jsonImagenes.substr(0,jsonImagenes.length-1);
					}
					jsonImagenes += ']}';
					//console.log(jsonImagenes);
				});
			}//fin imagenes
		}, app.webdb.onError, function(){
			jsonPerfilGlobal = json;
			jsonFormulariosGlobal = jsonForm;
			if(formularios && perfiles){
				$("#popupResult").popup("close");
				var ultimosincro = "";
				ultimosincro = $("#lstdSincro").val();
				console.log("fehca_sincro: "+ultimosincro);
				log("fehca_sincro: "+ultimosincro);
				var snow = formatDate(new Date(), "-", "Ymd")+' ' + hora(new Date());
				$.ajax({
					type: "POST",
					dataType: 'jsonp',
					jsonp: "jsoncallback",
					url: apiUrl+ "/syncCustomer",
					data: ({dateSincro: snow, obj: json, idusr:userLoginGlobal.getUserid()}),
					cache: false,
					dataType: "text",
					timeout: 120000, //2 min. timeout
					beforeSend: function(objeto){
						$.mobile.loading( "show", {html: "<img style='padding-left:35px' src='css/themes/images/ajax-loader.gif'/>"});
						console.log("inicia perfiles.");
						log("inicia perfiles.");
						$("#msgSincro").html("0.1% - Sincronización 1/5: Perfiles...");
					},
					success: function(datos){
						$("#msgSincro").html("10% - Sincronización 1/5: Perfiles...");
						exitoSincronizacion(datos, false);
						console.log("Finalizo perfiles.");
						log("Finalizo perfiles.");
						$("#msgSincro").html("19% - Sincronización 1/5: Perfiles...");
						// Cargos los formularios con el nuevo ID del cliente  desde el servidor
						db.transaction(function (tx) { 
							tx.executeSql("SELECT S.ID, C.ID_SERVER, S.ID_FORM_SERVER, S.ID_FORM_SERVER_R, S.FORM_PROD, S.CUSTOMER_REQUESTS,S.FORM,S.SUB_FORM,S.FORM_RESPONSE,strftime('%d/%m/%Y',S.DATE_CREATED) DATE_CREATED FROM STORAGE S JOIN CAP_CUSTOMER C ON S.CUSTOMER_REQUESTS = C.ID_CAP_CUSTOMER WHERE S.DATE_UPDATED > ? ",[$("#lstdSincro").val()],function(tx,results){
								var len = results.rows.length;
								jsonForm = '{"FORMULARIOS":[';
								for(var j=0;j<len;j++){
									var row = results.rows.item(j);
									jsonForm += '{"ID":"'+row['ID']+'","ID_FORM_SERVER":"'+row['ID_FORM_SERVER']+'","ID_FORM_SERVER_R":"'+row['ID_FORM_SERVER_R']+'","SUB_FORM":"'+row['SUB_FORM']+'","FORM_PROD":"'+row['FORM_PROD']+'","ID_SERVER":"'+row['ID_SERVER']+'","CUSTOMER_REQUESTS":"'+row['CUSTOMER_REQUESTS']+'","DATE_CREATED":"'+row['DATE_CREATED']+'","FORM":"'+row['FORM']+'","FORM_RESPONSE":'+row['FORM_RESPONSE'].replace(new RegExp('\r?\n','g'), '\\r\\n')+'},';
								}//fin for
								if(len > 0){
									jsonForm = jsonForm.substr(0,jsonForm.length-1);
								}
								jsonForm += ']}';
								//console.log(jsonForm);
							});
						}, app.webdb.onError, function(){ 
										$.ajax({
											type: "POST",
											dataType: 'jsonp',
											jsonp: "jsoncallback",
											url: apiUrl+ "/syncCustomer",
											data: ({dateSincro: snow, obj: jsonForm,idusr:userLoginGlobal.getUserid()}),
											cache: false,
											dataType: "text",
											timeout: 1200000, //2min. timeout
											beforeSend: function(objeto){
												$.mobile.loading( "show", {html: "<img style='padding-left:35px' src='css/themes/images/ajax-loader.gif'/>"});
												console.log("inicia formularios.");
												log("inicia formularios.");
												$("#msgSincro").html("20% - Sincronización 2/5: Formularios...");
											},
											success: function(datos){
												exitoSincronizacion(datos, false);
												console.log("finalizo formularios.");
												log("finalizo formularios.");
												$.ajax({
														type: "POST",
														dataType: 'jsonp',
														jsonp: "jsoncallback",
														url: apiUrl+ "/syncCustomer",
														data: ({dateSincro: snow, obj: jsonImagenes, idusr:userLoginGlobal.getUserid()}),
														cache: false,
														dataType: "text",
														beforeSend: function(objeto){
															$.mobile.loading( "show", {html: "<img style='padding-left:35px' src='css/themes/images/ajax-loader.gif'/>"});
															console.log("inicia imagenes.");
															log("inicia imagenes.");
															$("#msgSincro").html("40% - Sincronización 3/5: Imagenes...");
														},
														success: function(datos){
															exitoSincronizacion(datos, false);
															console.log("finalizo imagenes.");
															log("finalizo imagenes.");
															// Cargos los formularios con el nuevo ID del cliente  desde el servidor
															db.transaction(function (tx) { 
																tx.executeSql("SELECT s.ID_FORM_SERVER, ID_FORM_SERVER_R, FORM, SUB_FORM, ID_SOL,(SELECT ID_FORM_SERVER FROM STORAGE WHERE ID=ID_SOL) ID_SOL_SERVER,(SELECT ID_FORM_SERVER_R FROM STORAGE WHERE ID=ID_SOL) ID_SOL_SERVER_R, ID_GAR, ID_USER, g.DATE_CREATED FROM STORAGE s INNER JOIN GARANTIAS g ON g.ID_GAR=S.ID WHERE S.DATE_UPDATED > ?",[$("#lstdSincro").val()],function(tx,results){
																	var len = results.rows.length;
																	jsonGarantias = '{"RELACION":[';
																	for(var j=0;j<len;j++){
																		var row = results.rows.item(j);
																		jsonGarantias += '{"ID_FORM_SERVER":"'+row['ID_FORM_SERVER']+'","ID_FORM_SERVER_R":"'+row['ID_FORM_SERVER_R']+'","FORM":"'+row['FORM']+'","SUB_FORM":"'+row['SUB_FORM']+'","ID_SOL":"'+row['ID_SOL']+'","ID_SOL_SERVER":"'+row['ID_SOL_SERVER']+'","ID_SOL_SERVER_R":"'+row['ID_SOL_SERVER_R']+'","ID_GAR":"'+row['ID_GAR']+'","ID_USER":"'+row['ID_USER']+'","DATE_CREATED":"'+row['DATE_CREATED']+'"},';
																	}//fin for
																	if(len > 0){
																		jsonGarantias = jsonGarantias.substr(0,jsonGarantias.length-1);
																	}
																	jsonGarantias += ']}';
																	//console.log(jsonForm);
																});
															}, app.webdb.onError, function(){ 
																	
																	$.ajax({
																		type: "POST",
																		dataType: 'jsonp',
																		jsonp: "jsoncallback",
																		url: apiUrl+ "/syncCustomer",
																		data: ({dateSincro: snow, obj: jsonGarantias, idusr:userLoginGlobal.getUserid()}),
																		cache: false,
																		dataType: "text",
																		beforeSend: function(objeto){
																			$.mobile.loading( "show", {html: "<img style='padding-left:35px' src='css/themes/images/ajax-loader.gif'/>"});
																			console.log("inicia solicitud/garantia.");
																			log("inicia solicitud/garantia.");
																			$("#msgSincro").html("60% - Sincronización 4/5: Garantias...");
																			
																		},
																		success: function(datos){
																			var xdata = datos;
																			//Recibimos toda la informacion de la parte de sistema
																			$.ajax({
																				type: "POST",
																				dataType: 'jsonp',
																				jsonp: "jsoncallback",
																				url: apiUrl+ "/syncTablet",
																				data: ({dateSincro: ultimosincro, idusr:userLoginGlobal.getUserid(), compId: userLoginGlobal.getCompanyId()}),
																				cache: false,
																				dataType: "text",
																				beforeSend:function(){
																					$.mobile.loading( "show", {html: "<img style='padding-left:35px' src='css/themes/images/ajax-loader.gif'/>"});
																					console.log("inicia recepcion.");
																					log("inicia recepcion.");
																					$("#msgSincro").html("80% - Sincronización 5/5: Recepción de información nueva del servidor");
																				},
																				success:function(d){
																					data = JSON && JSON.parse(d) || $.parseJSON(d);
																					total1 = 0, total2 = 0;
																					if(data.CAP_CUSTOMER.length > 0) {
																						$.each(data.CAP_CUSTOMER, function(i, item) {
																							guardarClienteServer(item);
																							total1++;
																							//console.log('cliente '+i+' guardado');
																						});
																					}
																					total2 = 0;
																					if(data.FORMULARIOS.length > 0) {
																						$.each(data.FORMULARIOS, function(i, item) {
																							guardarFormularioServer(item);
																							total2++;
																							//console.log('cliente '+i+' guardado');
																						});
																					}
																					$("#msgSincro").html("100% - Sincronización Completada!");
																					alert("(se recibio: "+total1+":"+total2+")");
																					$("#msgSincro").html("100% - Preparando hoja de resultados...");
																					exitoSincronizacion(xdata);
																					console.log("finalizo solicitud/garantia.");
																					log("finalizo solicitud/garantia.");
																				},
																				error: function(objeto, mensaje, otroobj){$.mobile.loading("hide"); alert('Se agoto el tiempo de espera, imposible conectar con el servidor. (posible falla en la conexion de internet o desconexion del servidor).');console.log("Trono recepcion.");log("Trono recepcion."); }
																			});
																		},
																		error: function(objeto, mensaje, otroobj){$.mobile.loading("hide"); if(mensaje != 'timeout'){ alert(mensaje+": " + otroobj); } else {alert('Se agoto el tiempo de espera, imposible conectar con el servidor. (posible falla en la conexion de internet o desconexion del servidor).');}console.log("Trono solicitud/garantia.");log("Trono solicitud/garantia."); }
																	});
															});
														},
														error: function(objeto, mensaje, otroobj){$.mobile.loading("hide"); if(mensaje != 'timeout'){ alert(mensaje+": " + otroobj); } else {alert('Se agoto el tiempo de espera, imposible conectar con el servidor. (posible falla en la conexion de internet o desconexion del servidor).');}console.log("Trono imagenes.");log("Trono imagenes."); }
												});
											},
											error: function(objeto, mensaje, otroobj){$.mobile.loading("hide"); if(mensaje != 'timeout'){ alert(mensaje+": " + otroobj); } else {alert('Se agoto el tiempo de espera, imposible conectar con el servidor. (posible falla en la conexion de internet o desconexion del servidor).');}console.log("Trono formularios.");log("Trono formularios."); }
										});
							});
					},
					error: function(objeto, mensaje, otroobj){$.mobile.loading("hide"); if(mensaje != 'timeout'){ alert(mensaje+": " + otroobj); } else {alert('Se agoto el tiempo de espera, imposible conectar con el servidor. (posible falla en la conexion de internet o desconexion del servidor).');} console.log("Trono perfiles. " + mensaje);log("Trono perfiles. " + mensaje); }
				});
			}
		});
	}
}

function exitoSincronizacion(datos, finalizado){
	finalizado = (typeof finalizado == 'undefined')?true:finalizado;

	var db = app.webdb.db;
	var perfiles;
	var formularios;
	var imagenes;
	
	
	perfiles = "S";
	if($('#ssolicitudes').is(':checked'))
		formularios = "S";
	else 
		formularios = "N";
	if($('#simagenes').is(':checked'))
		imagenes = "S";
	else
		imagenes = "N";

	//console.log(datos);
	var json =  JSON.parse(datos);
	
	//Actualizamos los ids de los clientes con el valor del servidor
	if(json.clientes.length > 0) {
		$.each(json.clientes,function(id_cliente, id_cliente_server){
			db.transaction(function(tx){
				tx.executeSql("UPDATE CAP_CUSTOMER SET ID_SERVER = ? WHERE ID_CAP_CUSTOMER = ?",[id_cliente_server,id_cliente]);
			});
		});//fin each
	}
	//Actualizamos los ids de los clientes con el valor del servidor
	if(typeof json.formularios == 'object') {
		$.each(json.formularios,function(id_form, id_form_server){
			db.transaction(function(tx){
				tx.executeSql("UPDATE STORAGE SET ID_FORM_SERVER = ?, ID_FORM_SERVER_R=? WHERE ID = ?",[id_form_server.fserver, id_form_server.fserverr, id_form]);
			});
		});//fin each
	}
	if(finalizado) {
		db.transaction(function(tx){
			tx.executeSql("INSERT INTO SINCRONIZACIONES(PERFILES,SOLICITUDES,IMAGENES,USER_ID,FECHA_SINCRO) VALUES (?,?,?,?,strftime('%Y-%m-%d %H:%M:%S','now','localtime'))",[perfiles,formularios,imagenes,userLoginGlobal.getUserid()]);
		});
		
		$('#sp_fec_sincronizacion').html(formatDate(new Date())+' ' + hora(new Date()));//formatDate funcion creada en app_complemento.
		$('#sp_fec_sincronizacion2').html(formatDate(new Date())+' ' + hora(new Date()));//formatDate funcion creada en app_complemento.
		//--------enviar mensaje de exito-------
		var parsePerfil;
		var parseForms;
		var nombreCompleto;
		var tdTexto='';
		var cantCredi = 0;
		var cantFidu = 0;
		var cantHipo = 0;
		var cantPren = 0;
		var cantAho = 0;
		var cantDes = 0;
		var cantRem = 0;
		var cantPerfil = 0;
		var cantFactura = 0;
	
	
		if(jsonFormulariosGlobal.length == 0)
			parseForms = '';	
		else
			parseForms = JSON.parse(jsonFormulariosGlobal);
		$('#ul_detalleSincronizacion_list').html('');
		if(perfiles == 'S'){
			cantPerfil = 1;
		}
		parsePerfil = JSON.parse(jsonPerfilGlobal);
		if(parsePerfil.CAP_CUSTOMER.length > 0) {
			$.each(parsePerfil.CAP_CUSTOMER,function(index,datos){
				nombreCompleto = datos.FIRSTNAME+' '+datos.MIDNAME+' '+datos.LASTNAME1+' '+datos.LASTNAME2;
				tdTexto = '<tr>';
				tdTexto += '<td style="text-align: center;vertical-align: middle;">'+nombreCompleto+'</td>';
				tdTexto += '<td style="text-align: center;vertical-align: middle;">'+cantPerfil+'</td>';
				//console.log(jsonFormulariosGlobal);
				//console.log(nombreCompleto);
				cantCredi = 0;
				cantFidu = 0;
				cantHipo = 0;
				cantPren = 0;
				cantAho = 0;
				cantDes = 0;
				cantRem = 0;
				if(jsonFormulariosGlobal.length > 0) {
					$.each(parseForms.FORMULARIOS,function(index,datosForm){
						if(datos.ID_CAP_CUSTOMER == datosForm.CUSTOMER_REQUESTS){
							//console.log(datosForm.FORM);
							if(datosForm.FORM == 2)
								cantCredi++;
							else if(datosForm.FORM == 5)
								cantFidu++;
							else if(datosForm.FORM ==6)
								cantHipo++;
							else if(datosForm.FORM ==7)
								cantPren++;
							else if(datosForm.FORM ==3)
								cantAho++;
							else if(datosForm.FORM ==4)
								cantDes++;
							else if(datosForm.FORM ==8)
								cantRem++;
							else if(datosForm.FORM ==666)
								cantFactura++;
							//console.log('idForm:'+datosForm.FORM+', nombre:'+obtenerForm(datosForm.FORM));	
						}					
					});
				}
				var aux = "";
				if(cantCredi > 0)
					aux += cantCredi+' '+obtenerForm(2)+'<br>';
				if(cantFidu > 0)
					aux += cantFidu+' '+obtenerForm(5)+'<br>';
				if(cantHipo > 0)
					aux += cantHipo+' '+obtenerForm(6)+'<br>';
				if(cantPren > 0)
					aux += cantPren+' '+obtenerForm(7)+'<br>';
				aux = aux.substr(0,aux.length-4);
				tdTexto += '<td style="text-align: center;vertical-align: middle;">'+aux+'</td>';
				tdTexto += '<td style="text-align: center;vertical-align: middle;">'+cantAho+'</td>';
				tdTexto += '<td style="text-align: center;vertical-align: middle;">'+cantDes+'</td>';
				tdTexto += '<td style="text-align: center;vertical-align: middle;">'+cantRem+'</td>';
				tdTexto += '<td style="text-align: center;vertical-align: middle;">'+cantFactura+'</td>';
				tdTexto += '</tr>';
				$('#ul_detalleSincronizacion_list').append(tdTexto);
			});
		} else {
			cantCredi = 0;
			cantFidu = 0;
			cantHipo = 0;
			cantPren = 0;
			cantAho = 0;
			cantDes = 0;
			cantRem = 0;
			$.each(parseForms.FORMULARIOS,function(index,datosForm){
				if(datos.ID_CAP_CUSTOMER == datosForm.CUSTOMER_REQUESTS){
					//console.log(datosForm.FORM);
					if(datosForm.FORM == 2)
						cantCredi++;
					else if(datosForm.FORM == 5)
						cantFidu++;
					else if(datosForm.FORM ==6)
						cantHipo++;
					else if(datosForm.FORM ==7)
						cantPren++;
					else if(datosForm.FORM ==3)
						cantAho++;
					else if(datosForm.FORM ==4)
						cantDes++;
					else if(datosForm.FORM ==8)
						cantRem++;
					else if(datosForm.FORM ==666)
						cantFactura++;
					//console.log('idForm:'+datosForm.FORM+', nombre:'+obtenerForm(datosForm.FORM));	
				}					
			});
			$.each(parseForms.FORMULARIOS,function(index,datos){
				nombreCompleto = datos.FIRSTNAME+' '+datos.MIDNAME+' '+datos.LASTNAME1+' '+datos.LASTNAME2;
				tdTexto = '<tr>';
				tdTexto += '<td style="text-align: center;vertical-align: middle;">'+nombreCompleto+'</td>';
				tdTexto += '<td style="text-align: center;vertical-align: middle;">'+cantPerfil+'</td>';
				var aux = "";
				if(cantCredi > 0)
					aux += cantCredi+' '+obtenerForm(2)+'<br>';
				if(cantFidu > 0)
					aux += cantFidu+' '+obtenerForm(5)+'<br>';
				if(cantHipo > 0)
					aux += cantHipo+' '+obtenerForm(6)+'<br>';
				if(cantPren > 0)
					aux += cantPren+' '+obtenerForm(7)+'<br>';
				aux = aux.substr(0,aux.length-4);
				tdTexto += '<td style="text-align: center;vertical-align: middle;">'+aux+'</td>';
				tdTexto += '<td style="text-align: center;vertical-align: middle;">'+cantAho+'</td>';
				tdTexto += '<td style="text-align: center;vertical-align: middle;">'+cantDes+'</td>';
				tdTexto += '<td style="text-align: center;vertical-align: middle;">'+cantRem+'</td>';
				tdTexto += '<td style="text-align: center;vertical-align: middle;">'+cantFactura+'</td>';
				tdTexto += '</tr>';
				$('#ul_detalleSincronizacion_list').append(tdTexto);
			});
		}
		$("#msgSincro").html("");
		$('#div_contentMessage_2').html('<br>Sincronizaci&oacute;n completada. A las '+hora(new Date())+' del d&iacute;a '+formatDate(new Date()));
		irOpcion('msgResumenTrans');
	}
}

function getUltimaSincronizacion() {
	var db = app.webdb.db;	
	var fecha = "0";
	db.transaction(function(tx){
		tx.executeSql("SELECT MAX(ID_SINCRO), FECHA_SINCRO as ULTFECHA FROM SINCRONIZACIONES", [],function(tx, results){
			if(results.rows.length != 0){
				fecha = results.rows.item(0).ULTFECHA;
			}
			$("#lstdSincro").val(fecha);
		});
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
	else if(idPagina == "remesas")// id = 8
		div = "div_remesas";
	else if(idPagina == "evalFinanciera")// id = 9
		div = "div_evalFinanciera";
	else if(idPagina == "resolucion")// id = 10
		div = "div_resolucion";
	return div;
}

function obtenerDivForm(idForm){
	var div = "n/a";
	if(idForm == 1) // id = 1  
		div = "div_datosGenerales";
	else if(idForm == 2) // id = 2
		div = "div_datosCreditos";
	else if(idForm == 3) // id = 3
		div = "div_ahorros";
	else if(idForm == 4)// id = 4
		div = "div_depositosPlazo";
	else if(idForm == 5)// id = 5
		div = "div_fiduciario";
	else if(idForm == 6)// id = 6
		div = "div_hipotecaria";
	else if(idForm == 7)// id = 7
		div = "div_prendaria";
	else if(idForm == 8)// id = 8
		div = "div_remesas";
	else if(idForm == 9)// id = 8
		div = "div_evalFinanciera";
	else if(idForm == 10)// id = 8
		div = "div_resolucion";
	return $('#'+div);
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

function irOpcion(idPagina, divLimpiar, elem){
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
	$.mobile.loading( "show", {
		  textVisible: true,
		  html: "<img style='padding-left:35px' src='css/themes/images/ajax-loader.gif'/>"
	});
	if(divLimpiar != undefined){
		limpiarForm(divLimpiar);
	}

	if(idPagina == 'logout') {
		$.mobile.loading("hide");
		var isLogin = confirm("\xbfDeseas cerrar tu sesion?");
		if(isLogin){
			var db = app.webdb.db;
			db.transaction(function(tx){
				tx.executeSql("UPDATE USERLOGIN SET NOMBRE = '',PASS = '',USERID = '',ROLENAME = '',COMPANYNAME = '',COMPANYID = '',COMPANYPLACE = '',LOGEADO = 'N',MENSAJE = ''",[]);
			});
			userLoginGlobal = new UserLogin();
			idPagina = 'login';
			$('#txt_user').val('');
			$('#txt_pass').val('');			
		}else
			return;
	}
	else if(idPagina == 'productos'){
		try{
			if(typeof clientGlobal == "undefined"){
				//alert(typeof(clientGlobal));
				$.mobile.loading("hide");
				alert('Para ingresar a esta opci\u00f3n, debe buscar un cliente primero.');
				return;
			}else if(clientGlobal.getId() == 0){
				$.mobile.loading("hide");
				alert('Para ingresar a esta opci\u00f3n, debe buscar un cliente primero.');
				return;			
			}			
		}catch (e) {
			console.log(e)
		}		
		$('#productos_nombreCliente').html(clientGlobal.getNombreCompleto().toUpperCase());
	}
	else if(idPagina == 'clientes_list'){
		cargarListaCliente(0,0,50,1);
	}
	else if(idPagina == 'clientes_list_factura' || idPagina == 'clientes_list_remesas'){
		clientGlobal = undefined;
		if(idPagina == 'clientes_list_remesas') {
			cargarListaCliente(2,0,50,1);
		} else {
			cargarListaCliente(1,0,50,1);
		}
		idPagina = 'clientes_list';
	}
	else if(idPagina == 'client_product_list'){
		$('#lbl_cliNomb').html(clientGlobal.getNombreCompleto().toUpperCase());
		cargarListaSolicitudesCliente($(elem).data("stype"));
	}
	else if(idPagina == 'garantias_list'){
			$('#lbl_gtia_selcliNomb').html(clientGlobal.getNombreCompleto().toUpperCase());
			cargarListaGarantiasCliente($(elem).data("gtype"), $(elem).data("idSol"));
	}
	else if(idPagina == 'clientes'){
		// iniciamos los valores con teclado numerico
		$("#div_datosGenerales .format_number").NumBox('setup', { symbol: '', max: 99999999.99 });
		// iniciamos el formato
		$('.lbl_nformat').autoNumeric('init');
		//Cargamos las informacion y los eventos.
		cargarEventosListas();
	}
	else if(idPagina == 'hipotecaria'){
		//asignarFormCredito();
		//agregamos la inicializacion del autoNumeric
		$("#div_hipotecaria .format_number").NumBox({ symbol: '', max: 99999999.99 });
		// iniciamos el formato
		$('.lbl_nformat').autoNumeric('init');
		//Cargamos las informacion y los eventos.
		eventosHipotecarios();
		sumarEvaluaciones();
	}
	else if(idPagina == 'fiduciario'){
		//asignarFormCredito();
		//agregamos la inicializacion del autoNumeric
		$("#div_fiduciario .format_number").NumBox({ symbol: '', max: 99999999.99 });
		// iniciamos el formato
		$('.lbl_nformat').autoNumeric('init');
		//Cargamos las informacion y los eventos.
		eventosFiduciarios();
	}
	else if(idPagina == 'prendaria'){
		//asignarFormCredito();
		//agregamos la inicializacion del autoNumeric
		$("#div_prendaria .format_number").NumBox({ symbol: '', max: 99999999.99 });
		// iniciamos el formato
		$('.lbl_nformat').autoNumeric('init');
		//Cargamos las informacion y los eventos.
		eventosPrendarios();
	}
	else if(idPagina == 'evalFinanciera'){
		//asignarFormCredito();
		verificarEvalResLlena(9);
		//agregamos la inicializacion del autoNumeric
		$('#div_evalFinanciera .format_number').NumBox({ symbol: '', min:-999999999.99 , max: 999999999.99 });
		// iniciamos el formato
		$('.lbl_nformat').autoNumeric('init');
		//Cargamos las informacion y los eventos.
		evaluacionFinanciera();
	}
	else if(idPagina == 'resolucion'){
		//asignarFormCredito();
		verificarEvalResLlena(10);
		//agregamos la inicializacion del autoNumeric
		$("#div_resolucion .format_number").NumBox({ symbol: '', max: 99999999.99 });
		// iniciamos el formato
		$('.lbl_nformat').autoNumeric('init');
		//Cargamos las informacion y los eventos.
		eventosResolucion();
	}
	else if(idPagina == 'creditos'){
		//agregamos la inicializacion del autoNumeric
		$("#div_datosCreditos .format_number").NumBox({ symbol: '', max: 99999999.99 });
		// iniciamos el formato
		$('.lbl_nformat').autoNumeric('init');
		//Cargamos las informacion y los eventos.
		eventosCreditos();
	}
	else if(idPagina == 'ahorros'){
		//agregamos la inicializacion del autoNumeric
		$("#div_ahorros .format_number").NumBox({ symbol: '', max: 99999999.99 });
		// iniciamos el formato
		$('.lbl_nformat').autoNumeric('init');
		//Cargamos las informacion y los eventos.
		eventosAhorros();
	}
	else if(idPagina == 'depositosPlazo'){
		//agregamos la inicializacion del autoNumeric
		$("#div_depositosPlazo .format_number").NumBox({ symbol: '', max: 99999999.99 });
		// iniciamos el formato
		$('.lbl_nformat').autoNumeric('init');
		//Cargamos las informacion y los eventos.
		eventosDepositos();
	}
	else if(idPagina == 'remesas'){
		//agregamos la inicializacion del autoNumeric
		$("#div_remesas .format_number").NumBox({ symbol: '', max: 99999999.99 });
		// iniciamos el formato
		$('.lbl_nformat').autoNumeric('init');
		//Cargamos las informacion y los eventos.
		eventosRemesas();
	}
	else if(idPagina == 'facturacion'){
		//agregamos la inicializacion del autoNumeric
		$("#div_facturacion .format_number").NumBox({ symbol: '', max: 99999999.99 });
		// iniciamos el formato
		$('.lbl_nformat').autoNumeric('init');
		if(typeof clientGlobal == 'undefined') {
			$('#txt_fac_usuario').val(userLoginGlobal.getNombre());
			$('#txt_fac_fecha').val(formatDate(new Date()));
			$('#txt_fac_nombre').removeAttr('readonly');
			$('#txt_fac_identidad').removeAttr('readonly');
			$('#txt_fac_identidad').mask("0000-0000-00000");
		}

	}
	
	if(app.hdh.verificarLogin()){
		if(idPagina == 'garantias_list'){
			if(validarCredito()){
				$.mobile.changePage($('#pag_'+idPagina));
				$.mobile.loading("hide");
			} else {
				$.mobile.loading("hide");
			}
		} else {
			$.mobile.changePage($('#pag_'+idPagina));
			$.mobile.loading("hide");
		}
	} else {
		$.mobile.changePage($('#pag_login'));
		$.mobile.loading("hide");
	}
}

//Eventos de los objetos del Formulario de Clientes
function cargarEventosListas() {
	//Cargamos los datos segun sus condiciones
	cargarInfCondCliente();
	//aplicamos mascaras
	$("#cb_tipoIdentificacion").on("change",function(){
		var mascara = $(this).find('option:selected').attr("data-mask");
		$("#txt_noIdentidad").val("");
		$("#txt_noIdentidad").mask(mascara);
	});
	//Departamento y municipios
	$("#cb_departamento").on("change",function(){
		cargarMuni($(this).find('option:selected').val(), "#cb_municipio");return false;
	});	
	
	$("#cb_municipio").on("change",function(){
		cargarAldea($(this).find('option:selected').val(), $('#cb_departamento').find('option:selected').val(), "#cb_aldea"); return false;
	});

	//Para el CIIU
	$("#cb_ciiu_sector").on("change",function(){
		cargarSubsectores($(this).find('option:selected').val());
		$("#cb_ciiu_rama").html('<option value="">(Seleccione)</option>');
		$("#cb_ciiu_clase").html('<option value="">(Seleccione)</option>');
		$("#cb_ciiu_rama").selectmenu('refresh');
		$("#cb_ciiu_clase").selectmenu('refresh');
	});	
	$("#cb_ciiu_subsector").on("change",function(){
		cargarRamas($("#cb_ciiu_sector").find('option:selected').val(), $(this).find('option:selected').val());
		$("#cb_ciiu_clase").html('<option value="">(Seleccione)</option>');
		$("#cb_ciiu_clase").selectmenu('refresh');
	});
	$("#cb_ciiu_rama").on("change",function(){
		cargarClases($("#cb_ciiu_sector").find('option:selected').val(), $("#cb_ciiu_subsector").find('option:selected').val(), $(this).find('option:selected').val());
	});

	$("#cb_viviendaPropia").on("change",function(){
		if($(this).val() == "NO"){
			$("#tbl_viviendaPropia").fadeOut("slow");
			limpiarForm("tbl_viviendaPropia");
			$("#cb_techo").removeAttr("required");
			$("#cb_piso").removeAttr("required");
			$("#cb_paredes").removeAttr("required");
			$("#cb_inscrita").removeAttr("required");
			$("#txt_valorada").removeAttr("required");
			$("#txt_dirPatrimonio").removeAttr("required");
		} else {
			$("#cb_techo").attr("required","required");
			$("#cb_piso").attr("required","required");
			$("#cb_paredes").attr("required","required");
			$("#cb_inscrita").attr("required","required");
			$("#txt_valorada").attr("required","required");
			$("#txt_dirPatrimonio").attr("required","required");
			$("#tbl_viviendaPropia").fadeIn("slow");
		}
	});
	
	$("#cb_terrenos").on("change",function(){
		if($(this).val() == "NO"){
			$("#tbl_terrenos").fadeOut("slow");
			limpiarForm("tbl_terrenos");
			$("#txt_dirTerreno").removeAttr("required");
			$("#txt_descTerreno").removeAttr("required");
			$("#txt_valoradaTerreno").removeAttr("required");
			$("#cb_inscritaTerreno").removeAttr("required");
		} else {
			$("#txt_dirTerreno").attr("required","required");
			$("#txt_descTerreno").attr("required","required");
			$("#txt_valoradaTerreno").attr("required","required");
			$("#cb_inscritaTerreno").attr("required","required");
			$("#tbl_terrenos").fadeIn("slow");
		}
	});
	
	$("#cb_vehiculos").on("change",function(){
		if($(this).val() == "NO"){
			$("#tbl_vehiculos").fadeOut("slow");
			limpiarForm("tbl_vehiculos");
			$("#txt_descVehiculo").removeAttr("required");
			$("#txt_valor").removeAttr("required");
			$("#cb_pagado").removeAttr("required");
		} else {
			$("#txt_descVehiculo").attr("required","required");
			$("#txt_valor").attr("required","required");
			$("#cb_pagado").attr("required","required");
			$("#tbl_vehiculos").fadeIn("slow");
		}
	});

	$("#cb_totalmentePagados").on("change",function(){
		if($(this).val() == "SI"){
			$("#lbl_pagandoAOtroBienes").fadeOut("slow");
			$("#lbl_valorCoutaOtroBienes").fadeOut("slow");
			
			$("#lbl_pagandoAOtroBienes").find('input').val("");
			$("#lbl_valorCoutaOtroBienes").find('input').val("");
		} else {
			// los textos
			$("#lbl_pagandoAOtroBienes").fadeIn("slow");
			$("#lbl_valorCoutaOtroBienes").fadeIn("slow");
		}
	});

	$("#cb_inscrita").on("change",function(){
		if(eval($(this).val()) == 1) {
			$("#lbl_hipotecada").fadeIn("slow");
			$("#lbl_viviendaentidad").fadeIn("slow");
		} else {
			$("#lbl_hipotecada").fadeOut("slow");
			$("#lbl_viviendaentidad").fadeOut("slow");
			limpiarForm("lbl_hipotecada");
			limpiarForm("lbl_viviendaentidad");
		}
	});

	$("#cb_inscritaTerreno").on("change",function(){
		if(eval($(this).val()) == 1) {
			$("#lbl_hipotecadaTerreno").fadeIn("slow");
			$("#lbl_terrenoentidad").fadeIn("slow");
		} else {
			$("#lbl_hipotecadaTerreno").fadeOut("slow");
			$("#lbl_terrenoentidad").fadeOut("slow");
			limpiarForm("lbl_hipotecadaTerreno");
			limpiarForm("lbl_terrenoentidad");
		}
	});

	$("#cb_peps").on("change",function(){
		if($(this).val() == "SI") {
			$("#tr_peps").fadeIn("slow");
		} else {
			$("#tr_peps").fadeOut("slow");
			limpiarForm("tr_peps");
		}
	});

	$("#cb_pagado").on("change",function(){
		if($(this).val() == "NO") {
			$(".lbl_vehiculopagado").fadeIn("slow");
		} else {
			$(".lbl_vehiculopagado").fadeOut("slow");
			$(".lbl_vehiculopagado").find('input').val("");
			
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
		if(selectedOption.val() != "S"){
			$("#tr_noSoltero").show();
			$("#datosConyuge").show();
			$("#txt_noIdentidadConyuge").attr("required","required");
			$("#txt_primerNombreConyuge").attr("required","required");
			$("#txt_primerApellidoConyuge").attr("required","required");
			$("#txt_fechaNacimientoConyuge").attr("required","required");
		}
		else {
			$("#txt_noIdentidadConyuge").removeAttr("required");
			$("#txt_primerNombreConyuge").removeAttr("required");
			$("#txt_primerApellidoConyuge").removeAttr("required");
			$("#txt_fechaNacimientoConyuge").removeAttr("required");
			limpiarForm("tr_noSoltero");
			limpiarForm("datosConyuge");
			$("#tr_noSoltero").hide();
			$("#datosConyuge").hide();
		}
	});

	$("#cb_empleado").on("change",function(){
		var selectedOption = $(this).find("option:selected");
		if(selectedOption.val() == "SI"){
			$("#datosEmpleado").show();			
		}
		else {
			limpiarForm("datosEmpleado");
			$("#datosEmpleado").hide();
		}
	});
	//al cargar que muestre los valores
	calcularPatrominioCliente();
	$("#txt_valorada, #txt_valoradaTerreno, #txt_valor, #txt_valoradosOtroBienes").on("change",function(){
		calcularPatrominioCliente();
	});
}

function calcularPatrominioCliente() {
	var vivienda = eval($("#txt_valorada").NumBox('getRaw').length==0?0:$("#txt_valorada").NumBox('getRaw'));
	var terreno = eval($("#txt_valoradaTerreno").NumBox('getRaw').length==0?0:$("#txt_valoradaTerreno").NumBox('getRaw'));
	var vehiculo = eval($("#txt_valor").NumBox('getRaw').length==0?0:$("#txt_valor").NumBox('getRaw'));
	var otros = eval($("#txt_valoradosOtroBienes").NumBox('getRaw').length==0?0:$("#txt_valoradosOtroBienes").NumBox('getRaw'));
	var total = vivienda + terreno + vehiculo + otros;
		
	$('#mt_patrimonio').autoNumeric('set',total);
	$("#hd_patrimonio").val(total);
}

function cargarInfCondCliente() {
	// fijamos los combo
	$("#cb_ciiu_sector").parent().parent().css({'width':'1167px'});
	$("#cb_ciiu_subsector").parent().parent().css({'width':'1167px'});
	$("#cb_ciiu_rama").parent().parent().css({'width':'1167px'});
	$("#cb_ciiu_clase").parent().parent().css({'width':'1167px'});
	
	//ponemos datos default
	if($("#cb_tipoIdentificacion").find("option:selected").val() == "") {
		$("#cb_tipoIdentificacion").val("1");
		$("#cb_tipoIdentificacion").selectmenu('refresh');
	}
	
	if($("#txt_nacionalidad").val() == "") {
		$("#txt_nacionalidad").val("HONDUREÑO");
	}
	
	if($("#cb_tipoPersona").find("option:selected").val() == "") {
		$("#cb_tipoPersona").val("N");
		$('#cb_tipoPersona').selectmenu('refresh');
	}
	if($("#txt_pais").find("option:selected").val() == "") {
		$("#txt_pais").val("1");
		$('#txt_pais').selectmenu('refresh');
	}
	
	//aplicamos mascaras
	if($("#cb_tipoIdentificacion").find('option:selected').val() != ""){
		$("#txt_noIdentidad").mask($("#cb_tipoIdentificacion").find('option:selected').attr("data-mask"));
	}
	
	//departamentos y municipios
	$('#txt_pais').selectmenu('refresh');
	$('#cb_departamento').selectmenu('refresh');
	$('#cb_municipio').selectmenu('refresh');
	$('#cb_aldea').selectmenu('refresh');
	
	//CIIU
	$("#cb_ciiu_sector").selectmenu('refresh');
	$("#cb_ciiu_subsector").selectmenu('refresh');
	$("#cb_ciiu_rama").selectmenu('refresh');
	$("#cb_ciiu_clase").selectmenu('refresh');
	
	if($("#cb_viviendaPropia").val() == "NO"){
		$("#tbl_viviendaPropia").fadeOut("slow");
		limpiarForm("tbl_viviendaPropia");
	} else {
		$("#tbl_viviendaPropia").fadeIn("slow");
	}

	if($("#cb_terrenos").val() == "NO"){
		$("#tbl_terrenos").fadeOut("slow");
		limpiarForm("tbl_terrenos");
	} else {
		$("#tbl_terrenos").fadeIn("slow");
	}
	
	if($("#cb_vehiculos").val() == "NO"){
		limpiarForm("tbl_vehiculos");
		$("#tbl_vehiculos").fadeOut("slow");
	} else {
		$("#tbl_vehiculos").fadeIn("slow");
	}

	if($("#cb_totalmentePagados").find("option:selected").val() == "SI"){
		limpiarForm("lbl_pagandoAOtroBienes");
		limpiarForm("lbl_valorCoutaOtroBienes");
		$("#lbl_pagandoAOtroBienes").fadeOut("slow");
		$("#lbl_valorCoutaOtroBienes").fadeOut("slow");
	} else {
		$("#lbl_pagandoAOtroBienes").fadeIn("slow");
		$("#lbl_valorCoutaOtroBienes").fadeIn("slow");
	}

	if(eval($("#cb_inscrita").val()) == 1) {
		$("#lbl_hipotecada").fadeIn("slow");
		$("#lbl_viviendaentidad").fadeIn("slow");
	} else {
		limpiarForm("lbl_hipotecada");
		limpiarForm("lbl_viviendaentidad");
		$("#lbl_hipotecada").fadeOut("slow");
		$("#lbl_viviendaentidad").fadeOut("slow");
		
	}

	if(eval($("#cb_inscritaTerreno").val()) == 1) {
		$("#lbl_hipotecadaTerreno").fadeIn("slow");
		$("#lbl_terrenoentidad").fadeIn("slow");
	} else {
		limpiarForm("lbl_hipotecadaTerreno");
		limpiarForm("lbl_terrenoentidad");
		$("#lbl_hipotecadaTerreno").fadeOut("slow");
		$("#lbl_terrenoentidad").fadeOut("slow");
	}

	if($("#cb_peps").val() == "SI") {
		$("#tr_peps").fadeIn("slow");
	} else {
		limpiarForm("tr_peps");
		$("#tr_peps").fadeOut("slow");
	}

	if($("#cb_pagado").val() == "NO") {
		$(".lbl_vehiculopagado").fadeIn("slow");
	} else {
		limpiarForm("lbl_vehiculopagado");
		$(".lbl_vehiculopagado").fadeOut("slow");
	}
	
	if($("#cb_estadoCivil").find("option:selected").val() != "S"){
		$("#tr_noSoltero").show();
		$("#datosConyuge").show();			
	}
	else {
		limpiarForm("tr_noSoltero");
		limpiarForm("datosConyuge");
		$("#tr_noSoltero").hide();
		$("#datosConyuge").hide();
	}
	
	if($("#cb_empleado").find("option:selected").val() == "SI"){
		$("#datosEmpleado").show();			
	}
	else {
		limpiarForm("datosEmpleado");
		$("#datosEmpleado").hide();
	}
	
	
	if(eval($("#cb_referencias").find("option:selected").val()) == 1){
		$("#ref_bancarias").show();
		$("#ref_comerciales").hide();
		$("#ref_personales").hide();
	} else if(eval($("#cb_referencias").find("option:selected").val()) == 2){
		$("#ref_bancarias").hide();
		$("#ref_comerciales").show();
		$("#ref_personales").hide();		
	} else {
		$("#ref_bancarias").hide();
		$("#ref_comerciales").hide();
		$("#ref_personales").show();
	}
}

//Eventos de los objetos del Formulario de Creditos
function eventosCreditos() {
	cargarInfCondCredito();
	//Destinos y rubros
	$("#cb_cred_destino").on("change",function(){
		cargarRubros($(this).find('option:selected').val());return false;
	});	
	$("#cb_cred_rubro").on("change",function(){
		cargarActividadesEspecificas($(this).find('option:selected').val(), $('#cb_cred_destino').find('option:selected').val()); return false;
	});
	
	$("#cb_cred_producto").on("change", function(){
		$("#txt_cred_montoSolic").val("");
		$("#txt_cred_plazo").val("");
		$("#txt_cred_tasaInteres").val("");
		var myselect = $("#cb_cred_formaPago");
		myselect[0].selectedIndex = 0;
		myselect.selectmenu("refresh");
	});
	
	$("#txt_cred_montoSolic").on("blur", function(){
		var monto = $(this).NumBox("getRaw");
		if($("#cb_cred_producto").val() == 0){
			alert("Debe Seleccionar un producto");
			$("#cb_cred_producto").focus();
			return false;
		}
		
		if(monto != 0){
			validarProducto(eval($("#cb_cred_producto").val()), monto, $("#txt_cred_tasaInteres").val());
		}
	});
	$("#txt_cred_tasaInteres").on("blur",function(){
		if($(this).val().length != 0){
			validarProducto(eval($("#cb_cred_producto").val()), $("#txt_cred_montoSolic").NumBox("getRaw"), $(this).val());
		}
	});
	$("#txt_cred_plazo").on("blur",function(){
		if($(this).val().length != 0){
			validarProducto(eval($("#cb_cred_producto").val()), $("#txt_cred_montoSolic").NumBox("getRaw"), $("#txt_cred_tasaInteres").val(), $(this).val());
		}
	});	
	$("#cb_cred_formaPago").on("change",function(){
		if($(this).val().length != 0){
			validarProducto(eval($("#cb_cred_producto").val()), $("#txt_cred_montoSolic").NumBox("getRaw"), $("#txt_cred_tasaInteres").val(), $("#txt_cred_plazo").val(), $(this).find("option:selected").val());
		}
	});
	
	$("#cb_cred_metodologia").on("change",function(){
		if($(this).find('option:selected').text().toUpperCase() == "SOLIDARIO") {
			$("#td_cred_grupo").fadeIn("slow");
		} else {
			$("#td_cred_grupo").fadeOut("slow");
			limpiarForm("td_cred_grupo");
		}	
	});

	$("#btnCotiza").on("click", function () { 
		var monto = $("#txt_cred_montoSolic").val();
		var tasa = $("#txt_cred_tasaInteres").val();
		var cuotasCapital = $("#txt_cred_nCuotas").val();
		var cuotasInteres = $("#txt_cred_nCuotasInteres").val();
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
		  if(cuotasCapital == 0){
			alert("debe ingresar el numero de cuotas capital");
			$("#txt_cred_nCuotas").focus();
			return false;
		  }
		  if(cuotasInteres == 0){
			alert("debe ingresar el numero de cuotas interes");
			$("#txt_cred_nCuotasInteres").focus();
			return false;
		  }
		  $("#frmCotiza").html('<div style="text-align:center;">Cargando Información...</div>');
		  $("#frmCotiza").load(apiBaseUrl+"/product/cotizador?m="+monto+"&t="+tasa+"&cc="+cuotasCapital+"&ci="+cuotasInteres);
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

function cargarInfCondCredito() {
	if($("#editForm2").length){
		var d = $("#editForm2").val();
		if(d == "0"){
			$("#credId_gtia_fidu").val(0);
			$("#credId_gtia_hipo").val(0);
			$("#credId_gtia_pren").val(0);
			$("#credId_eval_fin").val(0);
			$("#credId_resolucion").val(0);
		}
	}
	//fijamos combos
	$("#cb_cred_destino").parent().parent().css({'width':'389px'});
	$("#cb_cred_rubro").parent().parent().css({'width':'389px'});
	$("#cb_cred_actEspecifica").parent().parent().css({'width':'389px'});
	$("#cb_cred_frecuenciaPago").parent().parent().css({'width':'389px'});
	
	//carga de datos default
	if($('#txt_cred_noIdentidad').val() == "") {
		$('#txt_cred_noIdentidad').val(clientGlobal.getNoIdentidad());
	}
	if($('#txt_cred_nombre').val() == "") {
		$('#txt_cred_nombre').val(clientGlobal.getNombreCompleto());
	}
	if($('#txt_cred_codCliente').val() == "") {
		$('#txt_cred_codCliente').val(clientGlobal.getId());
	}
	if($("#cb_neg_comerIndividual").find("option:selected").val() == ""){
		$("#cb_neg_comerIndividual").val("2");
		$("#cb_neg_comerIndividual").selectmenu("refresh");
	}
	if($("#cb_neg_actuaIntermediario").find("option:selected").val() == ""){
		$("#cb_neg_actuaIntermediario").val("2");
		$("#cb_neg_actuaIntermediario").selectmenu("refresh");
	}
	if($("#cb_cred_metodologia").find('option:selected').text().toUpperCase() == "SOLIDARIO") {
		$("#td_cred_grupo").show();
	} else {
		$("#td_cred_grupo").hide();
	}	

	//Para los beneficiarios
	if($("#txt_def_benSeg_nombre").val() == ""){
		$("#txt_def_benSeg_nombre").val("FUND. MICROFIN. HERMANDAD DE HONDURAS OPDF");
	}
	if($("#txt_def_benSeg_parentesco").val() == ""){
		$("#txt_def_benSeg_parentesco").val("CONTRATANTE");
	}
	if($("#txt_def_benSeg_direccion").val() == ""){
		$("#txt_def_benSeg_direccion").val("SAN MARCOS OCOTEPEQUE");
	}
	if($("#txt_def_benSeg_participa").val() == ""){
		$("#txt_def_benSeg_participa").val("SALDO PRESTAMO");
	}
	if($("#txt_benSeguro_participacion").val() == ""){
		$("#txt_benSeguro_participacion").val("REMANENTE");
	}
}


function validarProducto(prod, monto, tasa, plazo, fpago) {
	var db = app.webdb.db;
	var query = "";
	var params = [];
	tasa = eval(tasa) || 0;
	plazo = eval(plazo) || 0;
	fpago = eval(fpago) || 0;
	
	if(tasa == 0) {
		query = "SELECT * FROM PRODUCT_RATES WHERE PRODUCT = ? AND AMOUNT_MIN <= ? AND  AMOUNT_MAX >= ?";
		params = [prod, monto, monto];
	} else if(plazo == 0) {
		query = "SELECT * FROM PRODUCT_RATES WHERE PRODUCT = ? AND AMOUNT_MIN <= ? AND  AMOUNT_MAX >= ? AND RATE_MIN <= ? AND RATE_MAX >= ?";
		params = [prod, monto, monto, tasa, tasa];
	} else if(fpago == 0) {
		query = "SELECT * FROM PRODUCT_RATES WHERE PRODUCT = ? AND AMOUNT_MIN <= ? AND  AMOUNT_MAX >= ? AND RATE_MIN <= ? AND RATE_MAX >= ? AND TERM >= ?";
		params = [prod, monto, monto, tasa, tasa, plazo];
	} else {
		query = "SELECT * FROM PRODUCT_RATES WHERE PRODUCT = ? AND AMOUNT_MIN <= ? AND  AMOUNT_MAX >= ? AND RATE_MIN <= ? AND RATE_MAX >= ? AND TERM >= ? AND PAYMENT=?";
		params = [prod, monto, monto, tasa, tasa, plazo, fpago];
	}
	
	db.transaction(function(tx) {
		tx.executeSql(query, params, function(tx, results){
				var len = results.rows.length;
				if(len == 0){
					alert("Informacion no cumple condiciones para el producto seleccionado.");
					if(tasa == 0){
						$("#txt_cred_montoSolic").focus();
						$("#txt_cred_montoSolic").css({"background-color":"red", "color":"white"});
					} else if (plazo == 0){
						// Tasa de interes
						$("#txt_cred_tasaInteres").focus();
						$("#txt_cred_tasaInteres").css({"background-color":"red", "color":"white"});
					} else if (fpago == 0) {
						//plazo
						$("#txt_cred_plazo").focus();
						$("#txt_cred_plazo").css({"background-color":"red", "color":"white"});
					} else {
						//fORMA DE PAGO
						var myselect = $("#cb_cred_formaPago");
						myselect[0].selectedIndex = 0;
						myselect.selectmenu("refresh");
						$("#cb_cred_formaPago").parent().css({"background-color":"red", "color":"white"});
					}
				} else {
					$("#txt_cred_montoSolic").css({"background-color":"white", "color":"black"});
					$("#txt_cred_plazo").css({"background-color":"white", "color":"black"});
					$("#txt_cred_tasaInteres").css({"background-color":"white", "color":"black"});
					$("#cb_cred_formaPago").parent().css({"background-color":"#009245"});
				}
		}, function(err){ 
			alert(err.code)}
		);
	});
}
//cargar informacion de Creditos guardados
//Eventos de los objetos del Formulario de Ahorros
function eventosAhorros() {
	
}

//Eventos de los objetos del Formulario de Depositos
function eventosDepositos() {
	cargarInfCondDepositos();
	$("#cb_desPlazos_tipoIdentificacion1, #cb_desPlazos_tipoIdentificacion2").on("change",function(){
		if($(this).find('option:selected').text() == "Cedula de Identidad" ) {
			$(this).parent().parent().parent().next('td').find('input').val("");
			$(this).parent().parent().parent().next('td').find('input').mask("0000-0000-00000");
		} else if($(this).find('option:selected').text() == "Carnet de Residente" ) {
			$(this).parent().parent().parent().next('td').find('input').val("");
			$(this).parent().parent().parent().next('td').find('input').mask("S000000");
		}
	});
}

function cargarInfCondDepositos() {
	if($("#cb_desPlazos_tipoIdentificacion1").find('option:selected').text() == "Cedula de Identidad" ) {
		$("#cb_desPlazos_tipoIdentificacion1").parent().parent().parent().next('td').find('input').val("");
		$("#cb_desPlazos_tipoIdentificacion1").parent().parent().parent().next('td').find('input').mask("0000-0000-00000");
	} else if($("#cb_desPlazos_tipoIdentificacion1").find('option:selected').text() == "Carnet de Residente" ) {
		$("#cb_desPlazos_tipoIdentificacion1").parent().parent().parent().next('td').find('input').val("");
		$("#cb_desPlazos_tipoIdentificacion1").parent().parent().parent().next('td').find('input').mask("S000000");
	}
	
	if($("#cb_desPlazos_tipoIdentificacion2").find('option:selected').text() == "Cedula de Identidad" ) {
		$("#cb_desPlazos_tipoIdentificacion2").parent().parent().parent().next('td').find('input').val("");
		$("#cb_desPlazos_tipoIdentificacion2").parent().parent().parent().next('td').find('input').mask("0000-0000-00000");
	} else if($("#cb_desPlazos_tipoIdentificacion2").find('option:selected').text() == "Carnet de Residente" ) {
		$("#cb_desPlazos_tipoIdentificacion2").parent().parent().parent().next('td').find('input').val("");
		$("#cb_desPlazos_tipoIdentificacion2").parent().parent().parent().next('td').find('input').mask("S000000");
	}
}

//Eventos de los objetos del Formulario de Remesas
function eventosRemesas() {

}

//Eventos de los objetos del Garantia Fiduciara
function eventosFiduciarios() {
	//calculos los valores iniciales
	cargarInfCondFiduciario();
	calculoPatrimonioFiduciario();
	calculoActivosFiduciario();
	
	$("#cb_fidu_tipoIdentificacion").on("change",function(){
		var mascara = $(this).find('option:selected').attr("data-mask");
		$("#txt_fidu_identidad").val("");
		$("#txt_fidu_identidad").mask(mascara);
	});
	//Departamento y municipios
	$("#cb_fidu_departamento").on("change",function(){
		cargarMuni($(this).find('option:selected').val(), "#cb_fidu_municipio");return false;
	});	
	$("#cb_fidu_municipio").on("change",function(){
		cargarAldea($(this).find('option:selected').val(), $('#cb_fidu_departamento').find('option:selected').val(), "#cb_fidu_aldea"); return false;
	});
	
	$("#cb_fidu_viviendaPropia").on("change",function(){
		if($(this).val() == "NO"){
			$("#tb_fidu_vivienda").fadeOut("slow");
			limpiarForm("tb_fidu_vivienda");
		} else {
			$("#tb_fidu_vivienda").fadeIn("slow");
		}
	});
	$("#cb_fidu_terrenos").on("change",function(){
		if($(this).val() == "NO"){
			$("#tb_fidu_terrenos").fadeOut("slow");
		} else {
			$("#tb_fidu_terrenos").fadeIn("slow");
		}
	});
	$("#cb_fidu_vehiculos").on("change",function(){
		if($(this).val() == "NO"){
			$("#tb_fidu_vehiculo").fadeOut("slow");
		} else {
			$("#tb_fidu_vehiculo").fadeIn("slow");
		}
	});

	$("#cb_fidu_totalmentePagados").on("change",function(){
		if($(this).find('option:selected').val() == "SI"){
			// los textos
			$(".lbl_pagandoOtroBienes").fadeOut("slow");
		} else {
			// los textos
			$(".lbl_pagandoOtroBienes").fadeIn("slow");
			$(".lbl_pagandoOtroBienes").find('input').val("");
		}
	});
	
	$("#txt_fidu_fechaNacimiento").on("blur",function(){
		$("#txt_fidu_edad").val(calcular_edad($(this).val()));
	});

	$("#txt_fidu_fechaNacimientoConyuge").on("blur",function(){
		$("#txt_fidu_edadConyuge").val(calcular_edad($(this).val()));
	});

	$("#cb_fidu_estadoCivil").on("change", function (){
		var selectedOption = $(this).find("option:selected");
		if(selectedOption.val() != "S"){
			$("#tr_fidu_noSoltero").show();
			$("#div_fidu_conyuge").show();
			$("#td_fidu_numHijos").show();
		}
		else {
			$("#tr_fidu_noSoltero").hide();
			$("#div_fidu_conyuge").hide();
			$("#td_fidu_numHijos").hide();
		}
	});

	$("#cb_fidu_empleado").on("change",function(){
		var selectedOption = $(this).find("option:selected");
		if(selectedOption.val() == "SI"){
			$("#tbl_empleado").show();			
		}
		else {
			$("#tbl_empleado").hide();
		}
	});

	$("#txt_fidu_valoradaVivienda, #txt_terrenos_valoradaTerreno, #txt_fidu_valor, #txt_fidu_valoradosOtroBienes").on("blur",function(){
		//obtenemos los valores
		calculoPatrimonioFiduciario();
	});

	$("#txt_fidu_cajaBancos, #txt_fidu_prestamos, #txt_fidu_cuentasCobrar, #txt_fidu_proveedores, #txt_fidu_mercaderia, #txt_fidu_salarioPension, #txt_fidu_otrosIngresos, #txt_fidu_otros").on("blur",function(){
		calculoActivosFiduciario();
	});

	$("#cb_fidu_inscrita").on("change",function(){
		if($(this).val() == "SI") {
			$("#lbl_hipotecada").fadeIn("slow");
			$("#lbl_viviendaentidad").fadeIn("slow");
		} else {
			$("#lbl_hipotecada").fadeOut("slow");
			$("#lbl_viviendaentidad").fadeOut("slow");
		}
	});

	$("#cb_fidu_inscritaTerreno").on("change",function(){
		if($(this).val() == "SI") {
			$("#lbl_hipotecadaTerreno").fadeIn("slow");
			$("#lbl_terrenoentidad").fadeIn("slow");
		} else {
			$("#lbl_hipotecadaTerreno").fadeOut("slow");
			$("#lbl_terrenoentidad").fadeOut("slow");
			limpiarForm("lbl_hipotecadaTerreno");
			limpiarForm("lbl_terrenoentidad");
		}
	});

	$("#cb_fidu_pagado").on("change",function(){
		if($(this).val() == "NO") {
			$(".lbl_vehiculopagado").fadeIn("slow");
		} else {
			$(".lbl_vehiculopagado").fadeOut("slow");
			$(".lbl_vehiculopagado").find('input').val("");
		}
	});
}

function cargarInfCondFiduciario() {	
	
	if($('#txt_solf_noIdentidad').val()=="") {
		$('#txt_solf_noIdentidad').val(clientGlobal.getNoIdentidad());
	}
	if($('#txt_solf_nombre').val() == "") {
		$('#txt_solf_nombre').val(clientGlobal.getNombreCompleto());
	}
	if($('#txt_solf_codCliente').val() == "") {
		$('#txt_solf_codCliente').val(clientGlobal.getId());
	}
	
	//Cargamos la mascara
	$("#txt_fidu_noIdentidad").mask($("#cb_fidu_tipoIdentificacion").find('option:selected').attr("data-mask"));

	if($("#cb_fidu_viviendaPropia").find('option:selected').val() == "NO"){
		$("#tb_fidu_vivienda").fadeOut("slow");
	} else {
		$("#tb_fidu_vivienda").fadeIn("slow");
	}

	if($("#cb_fidu_terrenos").find('option:selected').val() == "NO"){
		$("#tb_fidu_terrenos").fadeOut("slow");
	} else {
		$("#tb_fidu_terrenos").fadeIn("slow");
	}

	if($("#cb_fidu_vehiculos").find('option:selected').val() == "NO"){
		$("#tb_fidu_vehiculo").fadeOut("slow");
	} else {
		$("#tb_fidu_vehiculo").fadeIn("slow");
	}

	if($("#cb_fidu_totalmentePagados").find('option:selected').val() == "SI"){
		// los textos
		$(".lbl_pagandoOtroBienes").fadeOut("slow");
	} else {
		// los textos
		$(".lbl_pagandoOtroBienes").fadeIn("slow");
	}

	if($("#cb_fidu_estadoCivil").find("option:selected").val() != "S"){
		$("#tr_fidu_noSoltero").show();
		$("#div_fidu_conyuge").show();
		$("#td_fidu_numHijos").show();
	} else {
		$("#tr_fidu_noSoltero").hide();
		$("#div_fidu_conyuge").hide();
		$("#td_fidu_numHijos").hide();
	}

	if($("#cb_fidu_empleado").find("option:selected").val() == "SI"){
		$("#tbl_empleado").show();			
	} else {
		$("#tbl_empleado").hide();
	}

	if($("#cb_fidu_inscrita").find('option:selected').val() == "SI") {
		$("#lbl_hipotecada").fadeIn("slow");
		$("#lbl_viviendaentidad").fadeIn("slow");
	} else {
		$("#lbl_hipotecada").fadeOut("slow");
		$("#lbl_viviendaentidad").fadeOut("slow");
	}

	if($("#cb_fidu_inscritaTerreno").find('option:selected').val() == "SI") {
		$("#lbl_hipotecadaTerreno").fadeIn("slow");
		$("#lbl_terrenoentidad").fadeIn("slow");
	} else {
		$("#lbl_hipotecadaTerreno").fadeOut("slow");
		$("#lbl_terrenoentidad").fadeOut("slow");
	}

	if($("#cb_fidu_pagado").find('option:selected').val() == "NO") {
		$(".lbl_vehiculopagado").fadeIn("slow");
	} else {
		$(".lbl_vehiculopagado").fadeOut("slow");
	}
}

function calculoPatrimonioFiduciario() {
	var c1 = $("#txt_fidu_valorada");
	var v1 = eval(c1.NumBox('getRaw').length==0?0:c1.NumBox('getRaw'));
	var v2 = eval($("#txt_fidu_valoradaTerreno").NumBox('getRaw').length==0?0:$("#txt_fidu_valoradaTerreno").NumBox('getRaw'));
	var v3 = eval($("#txt_fidu_valor").NumBox('getRaw').length==0?0:$("#txt_fidu_valor").NumBox('getRaw'));
	var v4 = eval($("#txt_fidu_valoradosOtroBienes").NumBox('getRaw').length==0?0:$("#txt_fidu_valoradosOtroBienes").NumBox('getRaw'));
	var total = v1 + v2 + v3 + v4;
	
	$("#mt_fidu_patrimonio").autoNumeric('set', total);
	$("#hd_fidu_patrimonio").val(total);
}

function calculoActivosFiduciario() {
	var b1 = eval($("#txt_fidu_valorada").NumBox('getRaw').length==0?0:$("#txt_fidu_valorada").NumBox('getRaw'));
	var b2 = eval($("#txt_fidu_valoradaTerreno").NumBox('getRaw').length==0?0:$("#txt_fidu_valoradaTerreno").NumBox('getRaw'));
	var b3 = eval($("#txt_fidu_valor").NumBox('getRaw').length==0?0:$("#txt_fidu_valor").NumBox('getRaw'));
	var b4 = eval($("#txt_fidu_valoradosOtroBienes").NumBox('getRaw').length==0?0:$("#txt_fidu_valoradosOtroBienes").NumBox('getRaw'));
	var vivienda = b1+b2;
	
	$("#txt_fidu_viviendaTerrenos").NumBox('setRaw',vivienda);
	$("#txt_fidu_vehiculos").NumBox('setRaw', b3);
	$("#txt_fidu_maquinariaEnseres").NumBox('setRaw', b4);
	
	var c1 = eval($("#txt_fidu_cajaBancos").NumBox('getRaw').length==0?0:$("#txt_fidu_cajaBancos").NumBox('getRaw'));
	var c2 = eval($("#txt_fidu_cuentasCobrar").NumBox('getRaw').length==0?0:$("#txt_fidu_cuentasCobrar").NumBox('getRaw'));
	var c3 = eval($("#txt_fidu_mercaderia").NumBox('getRaw').length==0?0:$("#txt_fidu_mercaderia").NumBox('getRaw'));
	var c4 = eval($("#txt_fidu_otros").NumBox('getRaw').length==0?0:$("#txt_fidu_otros").NumBox('getRaw'));
	var total = c1+c2+c3+vivienda+b3+b4+c4;
	$("#txt_fidu_total").NumBox('setRaw', total);
	
	var i1 = eval($("#txt_fidu_salarioPension").NumBox('getRaw').length==0?0:$("#txt_fidu_salarioPension").NumBox('getRaw'));
	var i2 = eval($("#txt_fidu_otrosIngresos").NumBox('getRaw').length==0?0:$("#txt_fidu_otrosIngresos").NumBox('getRaw'));
	
	var ingresos = i1 + i2;
	$("#txt_fidu_totalIngresos").NumBox('setRaw', ingresos);
	
	var p1 = eval($("#txt_fidu_prestamos").NumBox('getRaw').length==0?0:$("#txt_fidu_prestamos").NumBox('getRaw'));
	var p2 = eval($("#txt_fidu_proveedores").NumBox('getRaw').length==0?0:$("#txt_fidu_proveedores").NumBox('getRaw'));
	
	var pasivos = p1 + p2;
	
	$("#txt_fidu_totalPasivo").NumBox('setRaw',pasivos);
}

//Eventos de los objetos del Garantia Hipotecaria
function eventosHipotecarios() {
	cargarInfCondHipotecario();
	//Departamento y municipios
	$("#cb_hipo_departamento").on("change",function(){
		cargarMuni($(this).find('option:selected').val(), "#cb_hipo_municipio");return false;
	});	
	$("#cb_hipo_municipio").on("change",function(){
		cargarAldea($(this).find('option:selected').val(), $('#cb_hipo_departamento').find('option:selected').val(), "#cb_hipo_aldea"); return false;
	});
	
	
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
		
		sumarEvaluaciones();
	});

	$("#cb_hipo_tipoInmueble").on("change",function(){
		var selectedOption = $(this).find("option:selected");
		$("#txt_hipo_colinSolar_norte").removeAttr("required");
		$("#txt_hipo_colinSolar_sur").removeAttr("required");
		$("#txt_hipo_colinSolar_este").removeAttr("required");
		$("#txt_hipo_colinSolar_oeste").removeAttr("required");
		
		$("#txt_hipo_colinSolarCasa_norte").removeAttr("required");
		$("#txt_hipo_colinSolarCasa_sur").removeAttr("required");
		$("#txt_hipo_colinSolarCasa_este").removeAttr("required");
		$("#txt_hipo_colinSolarCasa_oeste").removeAttr("required");
		
		$("#txt_terr_colinMedInmueble_norte").removeAttr("required");
		$("#txt_terr_colinMedInmueble_sur").removeAttr("required");
		$("#txt_terr_colinMedInmueble_este").removeAttr("required");
		$("#txt_terr_colinMedInmueble_oeste").removeAttr("required");
			
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
			//agregamos las condiciones
			$("#txt_hipo_colinSolar_norte").attr("required","required");
			$("#txt_hipo_colinSolar_sur").attr("required","required");
			$("#txt_hipo_colinSolar_este").attr("required","required");
			$("#txt_hipo_colinSolar_oeste").attr("required","required");
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
			// Agregamos las validaciones respectivas.
			$("#txt_hipo_colinSolarCasa_norte").attr("required","required");
			$("#txt_hipo_colinSolarCasa_sur").attr("required","required");
			$("#txt_hipo_colinSolarCasa_este").attr("required","required");
			$("#txt_hipo_colinSolarCasa_oeste").attr("required","required");
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
			// Agregamos las validaciones respectivas.
			$("#txt_terr_colinMedInmueble_norte").attr("required","required");
			$("#txt_terr_colinMedInmueble_sur").attr("required","required");
			$("#txt_terr_colinMedInmueble_este").attr("required","required");
			$("#txt_terr_colinMedInmueble_oeste").attr("required","required");
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
			// Agregamos las validaciones respectivas.
			$("#txt_terr_colinMedInmueble_norte").attr("required","required");
			$("#txt_terr_colinMedInmueble_sur").attr("required","required");
			$("#txt_terr_colinMedInmueble_este").attr("required","required");
			$("#txt_terr_colinMedInmueble_oeste").attr("required","required");
			break;
		}
	});
	$("#cb_hipo_colinSolarCasa_ncasas").on("change",function(){
		var i = $(this).val();
		$(".ncasa").hide();
		$(".valCasa").hide();
		
		for(var j = 1; j <= i; j++)
		{
			$("#tbl_solarCasa_casa" + j).show();
			$("#infoCasa" + j).show();
		}
	});
	
	//Calculamos los precios
	$("#txt_cap_areaCulCafe_man_val").on("blur", function(){
		var v1 =eval($("#txt_cap_areaCulCafe_man").NumBox('getRaw').length==0?0:$("#txt_cap_areaCulCafe_man").NumBox('getRaw'));
		var v2 =eval($("#txt_cap_areaCulCafe_man_val").NumBox('getRaw').length==0?0:$("#txt_cap_areaCulCafe_man_val").NumBox('getRaw'));
		var cant = v1 * v2;
		$("#txt_cap_areaCulCafe_man_tol").NumBox('setRaw', cant); 
		
		sumarEvaluaciones();
	});

	$("#txt_cap_areaGranos_val").on("blur", function(){
		var v1 =eval($("#txt_cap_areaGranos_man").NumBox('getRaw').length==0?0:$("#txt_cap_areaGranos_man").NumBox('getRaw'));
		var v2 =eval($("#txt_cap_areaGranos_val").NumBox('getRaw').length==0?0:$("#txt_cap_areaGranos_val").NumBox('getRaw'));
		var cant = v1 * v2;
		$("#txt_cap_areaGranos_man_tol").NumBox('setRaw', cant); 
		
		sumarEvaluaciones();
	});

	$("#txt_cap_areaPastos_val").on("blur", function(){
		var v1 =eval($("#txt_cap_areaPastos_man").NumBox('getRaw').length==0?0:$("#txt_cap_areaPastos_man").NumBox('getRaw'));
		var v2 =eval($("#txt_cap_areaPastos_val").NumBox('getRaw').length==0?0:$("#txt_cap_areaPastos_val").NumBox('getRaw'));
		var cant = v1 * v2;
		$("#txt_cap_areaPastos_man_tol").NumBox('setRaw', cant); 
		
		sumarEvaluaciones();
	});

	$("#txt_cap_areaGuamiles_val").on("blur", function(){
		var v1 =eval($("#txt_cap_areaGuamiles_man").NumBox('getRaw').length==0?0:$("#txt_cap_areaGuamiles_man").NumBox('getRaw'));
		var v2 =eval($("#txt_cap_areaGuamiles_val").NumBox('getRaw').length==0?0:$("#txt_cap_areaGuamiles_val").NumBox('getRaw'));
		var cant = v1 * v2;
		$("#txt_cap_areaGuamiles_man_tol").NumBox('setRaw', cant); 
		
		sumarEvaluaciones();
	});

	$("#txt_cap_areaHortaliza_val").on("blur", function(){
		var v1 =eval($("#txt_cap_areaHortaliza_man").NumBox('getRaw').length==0?0:$("#txt_cap_areaHortaliza_man").NumBox('getRaw'));
		var v2 =eval($("#txt_cap_areaHortaliza_val").NumBox('getRaw').length==0?0:$("#txt_cap_areaHortaliza_val").NumBox('getRaw'));
		var cant = v1 * v2;
		$("#txt_cap_areaHortaliza_man_tol").NumBox('setRaw', cant); 
		
		sumarEvaluaciones();
	});

	$("#txt_cap_areaFrutal_val").on("blur", function(){
		var v1 =eval($("#txt_cap_areaFrutal_man").NumBox('getRaw').length==0?0:$("#txt_cap_areaFrutal_man").NumBox('getRaw'));
		var v2 =eval($("#txt_cap_areaFrutal_val").NumBox('getRaw').length==0?0:$("#txt_cap_areaFrutal_val").NumBox('getRaw'));
		var cant = v1 * v2;
		$("#txt_cap_areaFrutal_man_tol").NumBox('setRaw', cant); 
		
		sumarEvaluaciones();
	});

	$("#txt_cap_areaBosque_val").on("blur", function(){
		var v1 =eval($("#txt_cap_areaBosque_man").NumBox('getRaw').length==0?0:$("#txt_cap_areaBosque_man").NumBox('getRaw'));
		var v2 =eval($("#txt_cap_areaBosque_val").NumBox('getRaw').length==0?0:$("#txt_cap_areaBosque_val").NumBox('getRaw'));
		var cant = v1 * v2;
		$("#txt_cap_areaBosque_man_tol").NumBox('setRaw', cant); 
		
		sumarEvaluaciones();
	});

	$("#txt_cap_areaLaguna_val").on("blur", function(){
		var v1 =eval($("#txt_cap_areaLaguna_man").NumBox('getRaw').length==0?0:$("#txt_cap_areaLaguna_man").NumBox('getRaw'));
		var v2 =eval($("#txt_cap_areaLaguna_val").NumBox('getRaw').length==0?0:$("#txt_cap_areaLaguna_val").NumBox('getRaw'));
		var cant = v1 * v2;
		$("#txt_cap_areaLaguna_man_tol").NumBox('setRaw', cant); 
		
		sumarEvaluaciones();
	});

	$("#txt_cap_areaCasa_val").on("blur", function(){
		var v1 =eval($("#txt_cap_areaCasa_metros").NumBox('getRaw').length==0?0:$("#txt_cap_areaCasa_metros").NumBox('getRaw'));
		var v2 =eval($("#txt_cap_areaCasa_val").NumBox('getRaw').length==0?0:$("#txt_cap_areaCasa_val").NumBox('getRaw'));
		var cant = v1 * v2;
		$("#txt_cap_areaCasa_man_tol").NumBox('setRaw', cant); 
		
		sumarEvaluaciones();
	});
}

function cargarInfCondHipotecario() {
	if($('#txt_hipo_noIdentidad').val()=="") {
		$('#txt_hipo_noIdentidad').val(clientGlobal.getNoIdentidad());
	}
	if($('#txt_hipo_nombre').val() == "") {
		$('#txt_hipo_nombre').val(clientGlobal.getNombreCompleto());
	}
	if($('#txt_hipo_codCliente').val() == "") {
		$('#txt_hipo_codCliente').val(clientGlobal.getId());
	}
	if($('#txt_cap_asesorNeg').val() == ""){
		$('#txt_cap_asesorNeg').val(userLoginGlobal.getNombreCompleto().toUpperCase());
	}
	if($('#txt_cap_lugar').val() == ""){
		$('#txt_cap_lugar').val(userLoginGlobal.getCompanyPlace().toUpperCase());
	}
	if($('#txt_cap_Fecha').val() == ""){
		$('#txt_cap_Fecha').val(formatDate(new Date(),"-","Ymd"));
	}
	
	switch(eval($("#cb_hipo_tipoInmueble").find("option:selected").val())) {
		case 1:
			$("#div_hipo_dimInmuebleSolar").show();
			$("#div_hipo_dimInmuebleSolarCasa").hide();
			$("#div_hipo_dimInmuebleTerreno").hide();
			$("#tb_terr_areaCasa").hide();
			// hacemos lo mismo con las valuaciones
			$("#Solar").show();
			$("#TerrenoCasa").hide();
			$("#CasaTerreno").hide();
			$("#SolarCasa").hide();
			// Agregamos las validaciones respectivas.
			$("#txt_hipo_colinSolar_norte").attr("required","required");
			$("#txt_hipo_colinSolar_sur").attr("required","required");
			$("#txt_hipo_colinSolar_este").attr("required","required");
			$("#txt_hipo_colinSolar_oeste").attr("required","required");
			break;
		case 2:
			$("#div_hipo_dimInmuebleSolarCasa").show();
			$("#div_hipo_dimInmuebleSolar").hide();
			$("#div_hipo_dimInmuebleTerreno").hide();
			$("#tb_terr_areaCasa").hide();
			// hacemos lo mismo con las valuaciones
			$("#SolarCasa").show();
			$("#TerrenoCasa").hide();
			$("#CasaTerreno").hide();
			$("#Solar").hide();
			// Agregamos las validaciones respectivas.
			$("#txt_hipo_colinSolarCasa_norte").attr("required","required");
			$("#txt_hipo_colinSolarCasa_sur").attr("required","required");
			$("#txt_hipo_colinSolarCasa_este").attr("required","required");
			$("#txt_hipo_colinSolarCasa_oeste").attr("required","required");
			break;
		case 3:
			$("#div_hipo_dimInmuebleTerreno").show();
			$("#div_hipo_dimInmuebleSolar").hide();
			$("#div_hipo_dimInmuebleSolarCasa").hide();
			$("#tb_terr_areaCasa").hide();
			// hacemos lo mismo con las valuaciones
			$("#TerrenoCasa").show();
			$("#CasaTerreno").hide();
			$("#SolarCasa").hide();
			$("#Solar").hide();
			// Agregamos las validaciones respectivas.
			$("#txt_terr_colinMedInmueble_norte").attr("required","required");
			$("#txt_terr_colinMedInmueble_sur").attr("required","required");
			$("#txt_terr_colinMedInmueble_este").attr("required","required");
			$("#txt_terr_colinMedInmueble_oeste").attr("required","required");
			break;
		case 4:
			$("#div_hipo_dimInmuebleTerreno").show();
			$("#tb_terr_areaCasa").show();
			$("#div_hipo_dimInmuebleSolar").hide();
			$("#div_hipo_dimInmuebleSolarCasa").hide();
			// hacemos lo mismo con las valuaciones
			$("#TerrenoCasa").show();
			$("#CasaTerreno").show();
			$("#SolarCasa").hide();
			$("#Solar").hide();
			// Agregamos las validaciones respectivas.
			$("#txt_terr_colinMedInmueble_norte").attr("required","required");
			$("#txt_terr_colinMedInmueble_sur").attr("required","required");
			$("#txt_terr_colinMedInmueble_este").attr("required","required");
			$("#txt_terr_colinMedInmueble_oeste").attr("required","required");
			break;
		}

	var i = $("#cb_hipo_colinSolarCasa_ncasas").find("option:selected").val();
	
	$(".ncasa").hide();
	$(".valCasa").hide();
	for(var j = 1; j <= i; j++)
	{
		$("#tbl_solarCasa_casa" + j).show();
		$("#infoCasa" + j).show();
	}
	
	//Cargamos los datos de terrenos
	$('#txt_terr_cultovoCafe').change(); 
	$('#txt_terr_cultivoGranosMetros').change();
	$('#txt_terr_cultivoPastosMetros').change();
	$('#txt_terr_cultivoGuamilesMetros').change();
	$('#txt_terr_cultivoHortalizasMetros').change();
	$('#txt_terr_cultivoFrutalesMetros').change();
	$('#txt_terr_cultivoBosquesMetros').change();
	$('#txt_terr_cultivoLagunasMetros').change();
	
	sumarTerrenos();
}

//Eventos de los objetos del Garantia Prendaria
function eventosPrendarios() {
	//cargamos información primero
	cargarInfCondPrendario();
	
	$("#cb_pren_tipoGaranPrendaria").on("change",function() {
		$("#txt_pren_vehMarca").removeAttr("required");
		$("#txt_pren_vehModelo").removeAttr("required");
		$("#txt_pren_vehPlaca").removeAttr("required");
		$("#txt_pren_vehAnio").removeAttr("required");
		$("#txt_pren_vehTipo").removeAttr("required");
		$("#txt_pren_vehColor").removeAttr("required");
		$("#txt_pren_vehMotor").removeAttr("required");
		$("#txt_pren_vehChasis").removeAttr("required");
		$("#txt_pren_vehVin").removeAttr("required");
		$("#txt_pren_vehCilindaje").removeAttr("required");
		$("#cb_pren_vehEstado").removeAttr("required");
		$("#txt_pren_vehValor").removeAttr("required");
		$("#txt_pren_vehValorAvaluo").removeAttr("required");
		
		$("#cb_pren_maqTipoBien").removeAttr("required");
		$("#txt_pren_maqValor").removeAttr("required");
			
		$("#cb_pren_AhoClaseGarantia").removeAttr("required");
		$("#cb_pren_AhoTipoBien").removeAttr("required");
		$("#txt_pren_AhoNumDocumento").removeAttr("required");
		$("#txt_pren_AhoNombrePropietario").removeAttr("required");
		
		var selectedOption = $(this).find("option:selected");
		if(eval(selectedOption.val()) == 3){
			$("#div_pren_ven").show();
			$("#div_pren_maq").hide();
			$("#div_pren_Ahorro").hide();
			$("#div_pren_maqCapturas").show();
			
			$("#txt_pren_vehMarca").attr("required", "required");
			$("#txt_pren_vehModelo").attr("required", "required");
			$("#txt_pren_vehPlaca").attr("required", "required");
			$("#txt_pren_vehAnio").attr("required", "required");
			$("#txt_pren_vehTipo").attr("required", "required");
			$("#txt_pren_vehColor").attr("required", "required");
			$("#txt_pren_vehMotor").attr("required", "required");
			$("#txt_pren_vehChasis").attr("required", "required");
			$("#txt_pren_vehVin").attr("required", "required");
			$("#txt_pren_vehCilindaje").attr("required", "required");
			$("#cb_pren_vehEstado").attr("required", "required");
			$("#txt_pren_vehValor").attr("required", "required");
			$("#txt_pren_vehValorAvaluo").attr("required", "required");

		}else if(eval(selectedOption.val()) == 4){
			$("#div_pren_ven").hide();
			$("#div_pren_maq").show();
			$("#div_pren_Ahorro").hide();
			$("#div_pren_maqCapturas").show();
			
			$("#cb_pren_maqTipoBien").attr("required", "required");
			$("#txt_pren_maqValor").attr("required", "required");
			
		}else if(eval(selectedOption.val()) == 6){
			$("#div_pren_ven").hide();
			$("#div_pren_maq").hide();
			$("#div_pren_Ahorro").show();
			$("#div_pren_maqCapturas").hide();	

			$("#cb_pren_AhoClaseGarantia").attr("required", "required");
			$("#cb_pren_AhoTipoBien").attr("required", "required");
			$("#txt_pren_AhoNumDocumento").attr("required", "required");
			$("#txt_pren_AhoNombrePropietario").attr("required", "required");
					
		}
	});

	$("#cb_pren_maqTipoBien").on("change",function(){
		if($(this).val() != ""){
			porcentaje = $(this).find("option:selected").attr("data-porcien");
			$("#hd_pren_mapPorcentTipoBien").val(porcentaje);
			$("#txt_pren_maqGarantia").val(porcentaje+"%");
			var cant = eval($("#txt_pren_maqValor").NumBox("getRaw").length==0?0:$("#txt_pren_maqValor").NumBox("getRaw"));
			$("#txt_pren_maqMontoCobertura").NumBox("setRaw", (cant*(porcentaje/100)));
		}
	});
	
	$("#cb_pren_AhoTipoBien").on("change",function(){
		if($(this).val() != ""){
			porcentaje = $(this).find("option:selected").attr("data-porcien");
			$("#hd_pren_mapAhoPorGarantia").val(porcentaje); 
			$("#txt_pren_AhoPorGarantia").val(porcentaje+"%"); 
			var cantidad = eval($("#txt_pren_AhoSaldoCuenta").NumBox("getRaw").length==0?0:$("#txt_pren_AhoSaldoCuenta").NumBox("getRaw")); 
			$("#txt_pren_AhoValorGarantia").NumBox("setRaw",(cantidad*(porcentaje/100))); 
		}
	});
	
	
	$("#txt_pren_AhoSaldoCuenta").on("blur", function(){
		var v1 = eval($("#hd_pren_mapAhoPorGarantia").val());
		var v2 = eval($(this).NumBox('getRaw').length==0?0:$(this).NumBox('getRaw'));
		var ava = v2 * (v1/100); 
		$("#txt_pren_AhoValorGarantia").NumBox('setRaw', ava);
		
	});

	$("#txt_pren_maqValor").on("blur", function(){
		var v1 = eval($("#hd_pren_mapPorcentTipoBien").val());
		var v2 = eval($(this).NumBox('getRaw').length==0?0:$(this).NumBox('getRaw'));
		var ava = v2 * (v1/100); 
		$("#txt_pren_maqMontoCobertura").NumBox('setRaw', ava);
		
	});
}

function cargarInfCondPrendario() {
	if($('#txt_pren_maqFechaAvaluo').val() == ""){
		$('#txt_pren_maqFechaAvaluo').val(formatDate(new Date(),"-","Ymd"));
	}
	if($('#txt_pren_noIdentidad').val() == ""){
		$('#txt_pren_noIdentidad').val(clientGlobal.getNoIdentidad());
	}
	if($('#txt_pren_nombre').val() == ""){
		$('#txt_pren_nombre').val(clientGlobal.getNombreCompleto());
	}
	if($('#txt_pren_codCliente').val() == ""){
		$('#txt_pren_codCliente').val(clientGlobal.getId());
	}
		
			
			
	var selectedOption = $("#cb_pren_tipoGaranPrendaria").find("option:selected");
	if(eval(selectedOption.val()) == 3){
		$("#div_pren_ven").show();
		$("#div_pren_maq").hide();
		$("#div_pren_Ahorro").hide();
		$("#div_pren_maqCapturas").show();
		
		$("#txt_pren_vehMarca").attr("required", "required");
		$("#txt_pren_vehModelo").attr("required", "required");
		$("#txt_pren_vehPlaca").attr("required", "required");
		$("#txt_pren_vehAnio").attr("required", "required");
		$("#txt_pren_vehTipo").attr("required", "required");
		$("#txt_pren_vehColor").attr("required", "required");
		$("#txt_pren_vehMotor").attr("required", "required");
		$("#txt_pren_vehChasis").attr("required", "required");
		$("#txt_pren_vehVin").attr("required", "required");
		$("#txt_pren_vehCilindaje").attr("required", "required");
		$("#cb_pren_vehEstado").attr("required", "required");
		$("#txt_pren_vehValor").attr("required", "required");
		$("#txt_pren_vehValorAvaluo").attr("required", "required");
		
	}else if(eval(selectedOption.val()) == 4){
		$("#div_pren_ven").hide();
		$("#div_pren_maq").show();
		$("#div_pren_Ahorro").hide();
		$("#div_pren_maqCapturas").show();
		
		$("#cb_pren_maqTipoBien").attr("required", "required");
		$("#txt_pren_maqValor").attr("required", "required");
			
	}else if(eval(selectedOption.val()) == 6){
		$("#div_pren_ven").hide();
		$("#div_pren_maq").hide();
		$("#div_pren_Ahorro").show();
		$("#div_pren_maqCapturas").hide();	
			
		$("#cb_pren_AhoClaseGarantia").attr("required", "required");
		$("#cb_pren_AhoTipoBien").attr("required", "required");
		$("#txt_pren_AhoNumDocumento").attr("required", "required");
		$("#txt_pren_AhoNombrePropietario").attr("required", "required");
	}
}

// Funciones para Evaluación Financiera
function evaluacionFinanciera() {
	//Cargamos la informacion inicial
	cargarInformacion();
	
	//hacemos los calculos necesarios
	calculosBalance();
	calculosAnalisisCuota();
	calculoIndicadores();
	calculoCrecimiento();
	// para el Balance General
	$("#txt_bal_cajasyBancos, #txt_bal_cuentasxCobrar, #txt_bal_inventario, #txt_bal_invagro, #txt_bal_cuentasxPagar, #txt_bal_proveedores").on("blur",function(){
		calculosBalance();
		calculosAnalisisCuota();
		calculoIndicadores();
		calculoCrecimiento();
	});

	// para el Estado de resultados
	$("#txt_res_ventaContadoBueno, #txt_res_ventaContadoRegular , #txt_res_ventaContadoMalo, #txt_res_ventaCreditoBueno, #txt_res_ventaCreditoRegular, #txt_res_ventaCreditoMalo").on("blur",function(){
		calculosEstadosFin();
		calculosAnalisisCuota();
		calculoIndicadores();
		calculoCrecimiento();
	});
	
	$("#txt_res_salarios, #txt_res_alquiler , #txt_res_serviciosPublicos, #txt_res_alimentacion, #txt_res_educasalud, #txt_res_transotros, #txt_res_otros").on("blur",function(){
		calculosEstadosFin();
		calculosAnalisisCuota();
		calculoIndicadores();
		calculoCrecimiento();
	});
	
	$("#txt_res_pagoints, #txt_res_otrosIngresos , #txt_res_otrosIngresosFam, #txt_res_gastoFamiliar").on("blur",function(){
		calculosEstadosFin();
		calculosAnalisisCuota();
		calculoIndicadores();
		calculoCrecimiento();
	});
	
	$("#cb_res_costoVentas").on("change",function(){
		$("#txt_res_costoVenta").val(parseFloat($("option:selected",this).data("value")).toFixed(2) + "%");
		calculosEstadosFin();
		calculosAnalisisCuota();
		calculoIndicadores();
		calculoCrecimiento();
	});
	
	$("#txt_cuo_montoRecomendado").on("blur",function(){
		calculosAnalisisCuota();
		calculoIndicadores();
		calculoCrecimiento();
	});
	
	$("#txt_crec_activos_pasado, #txt_crec_pasivos_pasado, #txt_crec_capital_pasado, #txt_crec_inventario_pasado, #txt_crec_utilidad_pasado").on("blur", function(){
		calculoCrecimiento();
	});
	
	$("#btnFlujo").click(function () { 
		$.ajax({
			"type": "POST", 
			"async" : "false",
			"url":  apiUrl+"/getFlujoCaja", 
			"data" : $("#evalfin-form").serialize(),
			"beforeSend" : function(){
				$("#frmFlujo").html('<div style="text-align:center;">Cargando Información...</div>');
			},
			"success": function(data){
				$( "#dlgFlujoCaja").popup( "reposition", {x:266, y:2400} );
				$("#frmFlujo").html(data);
			},
		});
	});
}

function eventosResolucion() {
	if($('#txt_reso_noIdentidad').val().length == 0){
		$('#txt_reso_noIdentidad').val(clientGlobal.getNoIdentidad());
	}
	if($('#txt_reso_nombre').val().length == 0){
		$('#txt_reso_nombre').val(clientGlobal.getNombreCompleto());
	}
	if($('#txt_reso_codCliente').val().length == 0){
		$('#txt_reso_codCliente').val(clientGlobal.getId());
	}
	cargarAntecendentes();
	cargarDatosCredito();
	cargarGarantias();
}

//*<!--
function asignarFormCredito() {
	var db = app.webdb.db;
	var idDiv = 'div_datosCreditos';
	var idForm = 2;
	var idgf = parseInt($("#credId_gtia_fidu").val());
	if(idgf == 0 || parseInt($("#credId_gtia_hipo").val()) == 0 || parseInt($("#credId_gtia_pren").val()) == 0 || parseInt($("#credId_eval_fin").val()) == 0 || parseInt($("#credId_resolucion").val()) == 0) 
	{
		db.transaction(function(tx){
				tx.executeSql("SELECT ID FROM STORAGE WHERE FORM_PROD = ? AND FORM = ? AND CUSTOMER_REQUESTS = ? AND FORM_RESPONSE like '%txt_cred_montoSolic\":\"' || ? || '%txt_cred_tasaInteres\":\"'|| ? ||'%txt_cred_plazo\":\"' || ? || '%cb_cred_formaPago\":\"'|| ? ||'%'",
								[$('#cb_cred_producto').find('option:selected').val(), idForm, $('#txt_cred_codCliente').val(), $("#txt_cred_montoSolic").find("option:selected").val(), $("#txt_cred_tasaInteres").val(), $("#txt_cred_plazo").val(), $("#cb_cred_formaPago").val()],
					function(tx,results){
						var len = results.rows.length;
						if(len != 0){//ya existe
							var idformulario = results.rows.item(0);
							$("#credId_gtia_fidu").val(idformulario['ID']);
							$("#credId_gtia_hipo").val(idformulario['ID']);
							$("#credId_gtia_pren").val(idformulario['ID']);
							$("#credId_eval_fin").val(idformulario['ID']);
							$("#credId_resolucion").val(idformulario['ID']);
						} else {
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
							//recorrido de los text area
							$.each($('#'+idDiv+' textarea'), function(index, textarea){
								jsonText += '"'+textarea.id+'":"'+textarea.value+'",';
								//console.log(index + ")Id:"+select.id+", VALUE: " + select.value);
							});
							jsonText = jsonText.substr(0,jsonText.length-1);
							jsonText += '}';
							//console.log(jsonText);
							//almacenar en la base de datos
							
							var insert = "INSERT INTO STORAGE(FORM,FORM_PROD,FORM_RESPONSE,DATE_CREATED,ID_DIV,CUSTOMER_REQUESTS) VALUES(?,?,?,strftime('%Y-%m-%d','now','localtime'),?,?)";
							//insertar credito
							tx.executeSql(insert,[idForm,$('#cb_cred_producto').find('option:selected').val(),jsonText,idDiv,clientGlobal.getId()],function(tx, results){
								var id_storage = results.insertId;
								//recorrido de las imagenes
								$.each($('#'+idDiv+' img'), function(index, img){
									tx.executeSql("INSERT INTO FOTOS(ID_IMG,FOTO,ID_STORAGE) VALUES(?,?,?)",[img.id,$('#'+img.id+'_hd').val(),id_storage]);
								});
								if ($('#editForm'+idForm).length){
									$('#editForm'+idForm).val(id_storage);
								} else {
									var ubi = obtenerDivForm(idForm);
									$('<input type="hidden" name="editForm'+idForm+'" id="editForm'+idForm+'" value="'+id_storage+'" />').insertBefore(ubi);
								}
								$("#credId_gtia_fidu").val(id_storage);
								$("#credId_gtia_hipo").val(id_storage);
								$("#credId_gtia_pren").val(id_storage);
								$("#credId_eval_fin").val(id_storage);
								$("#credId_resolucion").val(id_storage);
							});
						}
					}//fin tx,results
				);
			},app.webdb.onError);
	}
}
//-->*/

function agregarLineasFactura(){
	var monto = $('#txt_fac_valor').NumBox('getRaw');
	if(monto.length == 0){
		alert('Debe ingresar un monto');
	}else{
		monto = $('#txt_fac_valor').NumBox('getRaw');
		if(monto == 0)
			alert('Debe ingresar un monto');
		else{
			var seq = $('#hd_seq').val();
			var comTiTrans = $('#cb_fac_tipoTransaccion').find('option:selected');
			var htmlTr = "<tr style='text-align: center;'><td>"+seq+"</td><td><input type='hidden' id='hd_fac_trans_"+seq+"' value='"+comTiTrans.val()+"'/>" + comTiTrans.text()+
					"</td><td>"+$('#txt_fac_tipoTrans').val()+"</td><td align='right'><span class='lbl_nformat'>"+monto.toFixed(2)+"</span></td></tr>";
			$('#nothing').hide();
			$('#details').append(htmlTr);
			$('#hd_seq').val(++seq);
			var total = eval($('#txt_fac_total').val());
			total += monto;
			$('#txt_fac_total').val(total);
			$('#lbl_fac_total').autoNumeric('set', total);
			$('#txt_fac_tipoTrans').val('');
			$('#txt_fac_valor').val('');
			//damos de nuevo formato
			$(".lbl_nformat").autoNumeric();
 		}
	}	
}

// Funciones para Dempartamento/Municipio/Aldea
function cargarDeps(){
	var db = app.webdb.db;
	var query = "SELECT ID_DEP,NOMBRE FROM DEPARTAMENTO";
	var html = "";
	db.transaction(function(tx){
		tx.executeSql(query,[],function(tx,results){
			var len = results.rows.length;
			$('#cb_departamento').html('<option value="">(Seleccione)</option>');
			for(var i=0;i<len;i++){				
				var row = results.rows.item(i);
				html = '<option value="'+row['ID_DEP']+'">'+row['ID_DEP']+' - '+row['NOMBRE']+'</option>';
				$('#cb_departamento').append(html);
			}//fin for
 			$('#cb_departamento').selectmenu('refresh');
		});
	}, app.webdb.onError);
}

function cargarMuni(val, div_muni, sel){
	var sel = sel || 0;
	var db = app.webdb.db;
	var query = "SELECT CODE, NOMBRE FROM MUNICIPIO WHERE ID_DEP = ? ORDER BY CODE";
	var html = "";
	db.transaction(function(tx){
		tx.executeSql(query,[val],function(tx,results){
			var len = results.rows.length;
			$(div_muni).html('<option value="">(Seleccione)</option>');
			for(var i=0;i<len;i++){				
				var row = results.rows.item(i);
				if(sel == row['CODE']){
					html = '<option value="'+row['CODE']+'" selected="selected">'+row['CODE']+' - '+row['NOMBRE']+'</option>';
				} else {
					html = '<option value="'+row['CODE']+'">'+row['CODE']+' - '+row['NOMBRE']+'</option>';
				}
				$(div_muni).append(html);
			}//fin for
			$(div_muni).selectmenu('refresh');
		});
	}, app.webdb.onError);
}

function cargarAldea(idm, idd, div_aldea, sel){
	var sel = sel || 0;
	var db = app.webdb.db;
	var query = "SELECT ID_ALD, NOMBRE FROM ALDEA WHERE ID_MUN = ? AND ID_DEP = ? ORDER BY ID_ALD";
	var html = "";
	db.transaction(function(tx){
		tx.executeSql(query,[idm, idd],function(tx,results){
			var len = results.rows.length;
			$(div_aldea).html('<option value="">(Seleccione)</option>');
			for(var i=0;i<len;i++){				
				var row = results.rows.item(i);
				if(sel == row['ID_ALD']){
					html = '<option value="'+row['ID_ALD']+'" selected="selected">'+row['ID_ALD']+' - '+row['NOMBRE']+'</option>';
				} else {
					html = '<option value="'+row['ID_ALD']+'">'+row['ID_ALD']+' - '+row['NOMBRE']+'</option>';
				}
				$(div_aldea).append(html);
			}//fin for
 			$(div_aldea).selectmenu('refresh');
		});
	}, app.webdb.onError);
}
// FIN Funciones para Dempartamento/Municipio/Aldea

// Funciones para Destinos/Rubros/Actividades
function cargarDestinos(){
	var db = app.webdb.db;
	var query = "SELECT ID_DEST,NOMBRE FROM DESTINO";
	var html = "";
	db.transaction(function(tx){
		tx.executeSql(query,[],function(tx,results){
			var len = results.rows.length;
			$('#cb_cred_destino').html('<option value="">(Seleccione)</option>');
			for(var i=0;i<len;i++){				
				var row = results.rows.item(i);
				html = '<option value="'+row['ID_DEST']+'">'+row['ID_DEST']+' - '+row['NOMBRE']+'</option>';
				$('#cb_cred_destino').append(html);
			}//fin for
 			$('#cb_cred_destino').selectmenu('refresh');
		});
	}, app.webdb.onError);
}

function cargarRubros(val, sel){
	var db = app.webdb.db;
	var query = "SELECT ID_INV, NOMBRE FROM RUBRO WHERE ID_DEST = ? ORDER BY ID_INV";
	var html = "";
	db.transaction(function(tx){
		tx.executeSql(query,[val],function(tx,results){
			var len = results.rows.length;
			$('#cb_cred_rubro').html('<option value="">(Seleccione)</option>');
			for(var i=0;i<len;i++){				
				var row = results.rows.item(i);
				if(sel == row['ID_INV']){
					html = '<option value="'+row['ID_INV']+'" selected="selected">'+row['ID_INV']+' - '+row['NOMBRE']+'</option>';
				} else {
					html = '<option value="'+row['ID_INV']+'">'+row['ID_INV']+' - '+row['NOMBRE']+'</option>';
				}
				$('#cb_cred_rubro').append(html);
			}//fin for
 			$('#cb_cred_rubro').selectmenu('refresh');
		});
	}, app.webdb.onError);
}

function cargarActividadesEspecificas(idd, idr, sel){
	var db = app.webdb.db;
	var query = "SELECT ID_SUB_INV,NOMBRE FROM ACT_ECO WHERE ID_INV = ? AND ID_DEST = ? ORDER BY ID_SUB_INV";
	var html = "";
	db.transaction(function(tx){
		tx.executeSql(query,[idd, idr],function(tx,results){
			var len = results.rows.length;
			$('#cb_cred_actEspecifica').html('<option value="">(Seleccione)</option>');
			for(var i=0;i<len;i++){				
				var row = results.rows.item(i);
				if(sel == row['ID_SUB_INV']){
					html = '<option value="'+row['ID_SUB_INV']+'" selected="selected">'+row['ID_SUB_INV']+' - '+row['NOMBRE']+'</option>';
				} else {
					html = '<option value="'+row['ID_SUB_INV']+'">'+row['ID_SUB_INV']+' - '+row['NOMBRE']+'</option>';
				}
				$('#cb_cred_actEspecifica').append(html);
			}//fin for
 			$('#cb_cred_actEspecifica').selectmenu('refresh');
		});
	}, app.webdb.onError);
}
// FIN Funciones para Destinos/Rubros/Actividades

// Funciones para CIIU Sector/Subsector/Rama/Clase
function cargarSectores() {
	var db = app.webdb.db;
	var query = "SELECT ID_SECTOR, NOMBRE FROM CIIU_SECTOR ORDER BY ID_SECTOR";
	var html = "";
	db.transaction(function(tx){
		tx.executeSql(query,[],function(tx,results){
			var len = results.rows.length;
			$('#cb_ciiu_sector').html('<option value="">(Seleccione)</option>');
			for(var i=0;i<len;i++){				
				var row = results.rows.item(i);
				html = '<option value="'+row['ID_SECTOR']+'">'+row['ID_SECTOR']+' - '+row['NOMBRE']+'</option>';
				$('#cb_ciiu_sector').append(html);
			}//fin for
 			$('#cb_ciiu_sector').selectmenu('refresh');
		});
	}, app.webdb.onError);
}

function cargarSubsectores(sector, sel) {
	var sel = sel || 0;
	var db = app.webdb.db;
	var query = "SELECT ID_SUBSECTOR, NOMBRE FROM CIIU_SUBSECTOR WHERE ID_SECTOR = ? ORDER BY ID_SUBSECTOR";
	var html = "";
	db.transaction(function(tx){
		tx.executeSql(query,[sector],function(tx,results){
			var len = results.rows.length;
			$("#cb_ciiu_subsector").html('<option value="">(Seleccione)</option>');
			for(var i=0;i<len;i++){				
				var row = results.rows.item(i);
				if(sel == row['ID_SUBSECTOR']){
					html = '<option value="'+row['ID_SUBSECTOR']+'" selected="selected">'+row['ID_SUBSECTOR']+' - '+row['NOMBRE']+'</option>';
				} else {
					html = '<option value="'+row['ID_SUBSECTOR']+'">'+row['ID_SUBSECTOR']+' - '+row['NOMBRE']+'</option>';
				}
				$("#cb_ciiu_subsector").append(html);
			}//fin for
			$("#cb_ciiu_subsector").selectmenu('refresh');
		});
	}, app.webdb.onError);
}

function cargarRamas(sector, subsector, sel) {
	var sel = sel || 0;
	var db = app.webdb.db;
	var query = "SELECT ID_RAMA, NOMBRE FROM CIIU_RAMA WHERE ID_SECTOR = ? AND ID_SUBSECTOR = ? ORDER BY ID_RAMA";
	var html = "";
	db.transaction(function(tx){
		tx.executeSql(query,[sector, subsector],function(tx,results){
			var len = results.rows.length;
			$("#cb_ciiu_rama").html('<option value="">(Seleccione)</option>');
			for(var i=0;i<len;i++){				
				var row = results.rows.item(i);
				if(sel == row['ID_RAMA']){
					html = '<option value="'+row['ID_RAMA']+'" selected="selected">'+row['ID_RAMA']+' - '+row['NOMBRE']+'</option>';
				} else {
					html = '<option value="'+row['ID_RAMA']+'">'+row['ID_RAMA']+' - '+row['NOMBRE']+'</option>';
				}
				$("#cb_ciiu_rama").append(html);
			}//fin for
 			$("#cb_ciiu_rama").selectmenu('refresh');
		});
	}, app.webdb.onError);
}

function cargarClases(sector, subsector, rama, sel) {
	var sel = sel || 0;
	var db = app.webdb.db;
	var query = "SELECT ID_CLASE, NOMBRE FROM CIIU_CLASE WHERE ID_SECTOR = ? AND ID_SUBSECTOR = ? AND ID_RAMA = ? ORDER BY ID_CLASE";
	var html = "";
	db.transaction(function(tx){
		tx.executeSql(query,[sector, subsector, rama],function(tx,results){
			var len = results.rows.length;
			$("#cb_ciiu_clase").html('<option value="">(Seleccione)</option>');
			for(var i=0;i<len;i++){				
				var row = results.rows.item(i);
				if(sel == row['ID_CLASE']){
					html = '<option value="'+row['ID_CLASE']+'" selected="selected">'+row['ID_CLASE']+' - '+row['NOMBRE']+'</option>';
				} else {
					html = '<option value="'+row['ID_CLASE']+'">'+row['ID_CLASE']+' - '+row['NOMBRE']+'</option>';
				}
				$("#cb_ciiu_clase").append(html);
			}//fin for
 			$("#cb_ciiu_clase").selectmenu('refresh');
		});
	}, app.webdb.onError);
}
// FIN Funciones para CIIU Sector/Subsector/Rama/Clase

function cargarListaCliente(factura, inicio, por_pagina, limpiar){
	inicio = inicio || 0;
	por_pagina = por_pagina || 250;
	factura = factura || 0;
	limpiar = limpiar || 0;
	var db = app.webdb.db;
	var query = "SELECT ID_CAP_CUSTOMER, FIRSTNAME, MIDNAME, LASTNAME1, LASTNAME2, NATIONALITY, IDENTITY FROM CAP_CUSTOMER ORDER BY LASTNAME1, LASTNAME2 LIMIT "+por_pagina+" OFFSET "+inicio;
	var html = "";
	db.transaction(function(tx){
		tx.executeSql(query,[],function(tx,results){
			var len = results.rows.length;
			if(limpiar != 0) {
				$('#ul_detalleCliente_list').html("");
			}
			for(var i=0;i<len;i++){
				var row = results.rows.item(i);
				if(limpiar != 0) {
					curr = i + 1;
				} else {
					curr =  eval(inicio) + i + 1;
				}
				html = '<tr><td><img style="width:16px;height:16px;" src="images/ico-perfil.png" /></td><td>'+curr+'</td>';
				html += '<td style="width: 60px">'+row['ID_CAP_CUSTOMER']+'</td><td>'+row['FIRSTNAME'].toUpperCase()+' '+row['MIDNAME'].toUpperCase()+'</td><td>'+row['LASTNAME1'].toUpperCase()+' '+row['LASTNAME2'].toUpperCase()+'</td><td>'+row['IDENTITY']+'</td>';
				html += '<td width="16%"><img src="images/bot-seleccionar.png" onclick="llenarClienteSesion('+row['ID_CAP_CUSTOMER']+');return false;"/></td></tr>';
				$('#ul_detalleCliente_list').append(html);
			}//fin for
			$("#hdnpag").val(eval(inicio)+por_pagina);
			
			if(factura == 1){
				$("#fctnc").find('a').attr("onclick","irOpcion('facturacion');return false;");
				$("#fctnc").find('a').html("Facturar no Cliente");
				$("#fctnc").show();
			} else if(factura == 2) {
				$("#fctnc").find('a').attr("onclick","irOpcion('remesas');return false;");
				$("#fctnc").find('a').html("Remesa no Cliente");
				$("#fctnc").show();
			} else {
				$("#fctnc").hide();
			}
			
			if(len < por_pagina) {
				$("#btnpagcli").closest('.ui-btn').hide();
			} else {
				$("#btnpagcli").closest('.ui-btn').show();
			}
		});
	}, app.webdb.onError);
}

function cargarListaSolicitudesCliente(tipo){
	var idForm =0;
	if(tipo=='credito'){
		idForm=2;
	} else if(tipo=='ahorro'){
		idForm=3;
	} else if(tipo=='deposito'){
		idForm=4;
	} else if(tipo=='remesa'){
		idForm=8;
	}
	var db = app.webdb.db;
	var query = "SELECT ID, FORM_RESPONSE, DATE_CREATED FROM STORAGE WHERE FORM=? AND CUSTOMER_REQUESTS=? ORDER BY ID DESC";
	var html = "";
	
	db.transaction(function(tx){
		tx.executeSql(query,[idForm, clientGlobal.getId()],function(tx,results){
			var len = results.rows.length;
			console.log('cliente tiene registrado ' + len + ' solicitudes');
			$('#ul_detalleProducto_list').html("");
			if(tipo=='credito'){
				//Mostramos el encabezado
				$("#head-credito").show();
				$("#head-ahorro").hide();
				$("#head-deposito").hide();
				$("#head-remesa").hide();
				//ingresamos los valores
				for(var i=0;i<len;i++){
					var row = results.rows.item(i);
					var info = $.parseJSON(row['FORM_RESPONSE']);
					html  = '<tr>';
					html += '<td>'+row['ID']+'</td>';
					html += '<td>'+$("#cb_cred_producto").find('option[value='+info.cb_cred_producto+']').text()+'</td>';
					html += '<td>L. '+info.txt_cred_montoSolic+'</td>';
					html += '<td>'+info.txt_cred_plazo+' Meses</td>';
					html += '<td>'+$("#cb_cred_destino").find('option[value='+info.cb_cred_destino+']').text()+'</td>';
					html += '<td>'+row['DATE_CREATED']+'</td>';
					html += '<td width="16%"><img src="images/bot-seleccionar.png" onclick="llenarSolicitud('+row['ID']+', 2);return false;"/></td></tr>';
					$('#ul_detalleProducto_list').append(html);
				}//fin for
			} 
			else if(tipo=='ahorro'){
				//Mostramos el encabezado
				$("#head-credito").hide();
				$("#head-ahorro").show();
				$("#head-deposito").hide();
				$("#head-remesa").hide();
				//ingresamos los valores
				for(var i=0;i<len;i++){
					var row = results.rows.item(i);
					var info = $.parseJSON(row['FORM_RESPONSE']);
					html  = '<tr>';
					html += '<td>'+row['ID']+'</td>';
					html += '<td>'+$("#cb_aho_producto").find('option[value='+info.cb_aho_producto+']').text()+'</td>';
					html += '<td>L. '+info.txt_aho_montoApertura+'</td>';
					html += '<td>'+row['DATE_CREATED']+'</td>';
					html += '<td width="16%"><img src="images/bot-seleccionar.png" onclick="llenarSolicitud('+row['ID']+', 3);return false;"/></td></tr>';
					$('#ul_detalleProducto_list').append(html);
				}//fin for
			} 
			else if(tipo=='deposito'){
				//Mostramos el encabezado
				$("#head-credito").hide();
				$("#head-ahorro").hide();
				$("#head-deposito").show();
				$("#head-remesa").hide();
				//ingresamos los valores
				for(var i=0;i<len;i++){
					var row = results.rows.item(i);
					var info = $.parseJSON(row['FORM_RESPONSE']);
					html  = '<tr>';
					html += '<td>'+row['ID']+'</td>';
					html += '<td>'+$("#cb_desPlazos_producto").find('option[value='+info.cb_desPlazos_producto+']').text()+'</td>';
					html += '<td>L. '+info.txt_desPlazos_monto+'</td>';
					html += '<td>'+info.cb_desPlazos_plazo+' Meses</td>';
					html += '<td>'+row['DATE_CREATED']+'</td>';
					html += '<td width="16%"><img src="images/bot-seleccionar.png" onclick="llenarSolicitud('+row['ID']+', 4);return false;"/></td></tr>';
					$('#ul_detalleProducto_list').append(html);
				}//fin for
			} 
			else if(tipo=='remesa'){
				//Mostramos el encabezado
				$("#head-credito").hide();
				$("#head-ahorro").hide();
				$("#head-deposito").hide();
				$("#head-remesa").show();
				//ingresamos los valores
				for(var i=0;i<len;i++){
					var row = results.rows.item(i);
					var info = $.parseJSON(row['FORM_RESPONSE']);
					html  = '<tr>';
					html += '<td>'+row['ID']+'</td>';
					html += '<td>'+info.cb_rem_transaccion+'</td>';
					html += '<td>L. '+info.txt_rem_mtcn+'</td>';
					html += '<td>'+info.txt_rem_paisEnvio+' Meses</td>';
					html += '<td>'+row['DATE_CREATED']+'</td>';
					html += '<td width="16%"><img src="images/bot-seleccionar.png" onclick="llenarSolicitud('+row['ID']+', 8);return false;"/></td></tr>';
					$('#ul_detalleProducto_list').append(html);
				}//fin for
			}
		});
	}, app.webdb.onError);
}

function cargarListaGarantiasCliente(garantia,inicio, por_pagina, limpiar){
	inicio = inicio || 0;
	por_pagina = por_pagina || 50;
	limpiar = limpiar || 0;
	var idForm=0;
	if(garantia=='fiduciario'){
		idForm=1;
	} else if(garantia=='hipotecaria'){
		idForm=6;
	} else if(garantia=='prendaria'){
		idForm=7;
	}
	var db = app.webdb.db;
	if(garantia=='fiduciario'){
		var query = "SELECT ID, FORM_RESPONSE, CUSTOMER_REQUESTS FROM STORAGE WHERE FORM=? LIMIT "+por_pagina+" OFFSET "+inicio;
		var params = [idForm];
	} else {
		var query = "SELECT ID, FORM_RESPONSE, CUSTOMER_REQUESTS FROM STORAGE WHERE FORM=? AND CUSTOMER_REQUESTS=?";
		var params = [idForm, clientGlobal.getId()];
	}
	var html = "";
	var prendas = ['','','','Vehicular','Maquinaria/Bienes','','Ahorros'];
	var inmuebles = ['','Solar','Solar y Casa','Terreno','Terreno y Casa'];
	if(idForm == 1) {
		$("#newGarantia").hide();
	} else {
		$("#newGarantia").show();
		$("#newGarantia").on("click", function(e){
			e.preventDefault();
			if(garantia=='prendaria'){
				$("#cb_pren_tipoGaranPrendaria").selectmenu('enable');
			}
			irOpcion(garantia);
		});
	}
	db.transaction(function(tx){
		tx.executeSql(query,params,function(tx,results){
			var len = results.rows.length;
			console.log('hay ' + len + ' garantias');
			$('#ul_detalleElemento_list').html("");
			if(garantia=='fiduciario'){
				//Mostramos el encabezado
				$("#head-fiduciario").show();
				$("#head-hipotecario").hide();
				$("#head-prendario_vehiculo").hide();
				$("#head-prendario_maquinaria").hide();
				$("#head-prendario_ahorro").hide();
				fidu_identidades = [];
				//ingresamos los valores
				for(var i=0;i<len;i++){
					var row = results.rows.item(i);
					if(row['CUSTOMER_REQUESTS'] == clientGlobal.getId()){
						continue;
					}
					var info = $.parseJSON(row['FORM_RESPONSE']);
					//if($.inArray(info.txt_fidu_identidad,fidu_identidades) == -1){
						html  = '<tr>';
						html += '<td>'+row['ID']+'</td>';
						html += '<td>'+info.txt_noIdentidad+'</td>';
						html += '<td>'+info.txt_primerNombre.toUpperCase()+' ';
						html += info.txt_segundoNombre==null?'</td>':info.txt_segundoNombre.toUpperCase()+'</td>';
						html += '<td>'+info.txt_primerApellido.toUpperCase()+' ';
						html += info.txt_segundoApellido==null?'</td>':info.txt_segundoApellido.toUpperCase() + '</td>';
						html += '<td>L. '+formatMoney(info.txt_total, 2)+'</td>';
						html += '<td width="16%"><img src="images/bot-seleccionar.png" onclick="llenarSolicitud('+row['ID']+', 1);return false;"/></td></tr>';
						$('#ul_detalleElemento_list').append(html);
					//	fidu_identidades.push(info.txt_fidu_identidad);
					//}
				}//fin for
				
			} 
			else if(garantia=='hipotecaria'){
				//Mostramos el encabezado
				$("#head-fiduciario").hide();
				$("#head-hipotecario").show();
				$("#head-prendario_vehiculo").hide();
				$("#head-prendario_maquinaria").hide();
				$("#head-prendario_ahorro").hide();
				fidu_hipotecas = [];
				//ingresamos los valores
				for(var i=0;i<len;i++){
					var row = results.rows.item(i);
					var info = $.parseJSON(row['FORM_RESPONSE']);
					if($.inArray(info.cb_hipo_tipoInmueble+'-'+info.txt_hipo_numero+'-'+info.txt_hipo_tomo,fidu_hipotecas) == -1){
						html  = '<tr>';
						html += '<td>'+row['ID']+'</td>';
						html += '<td>'+inmuebles[info.cb_hipo_tipoInmueble]+'</td>';
						html += '<td>'+info.txt_hipo_numero+'</td>';
						html += '<td>'+info.txt_hipo_tomo+'</td>';
						html += '<td>L. '+info.txt_cap_total_avaluo+'</td>';
						html += '<td width="16%"><img src="images/bot-seleccionar.png" onclick="llenarSolicitud('+row['ID']+', 6, 1);return false;"/></td></tr>';
						$('#ul_detalleElemento_list').append(html);
						fidu_hipotecas.push(info.cb_hipo_tipoInmueble+'-'+info.txt_hipo_numero+'-'+info.txt_hipo_tomo);
					}
				}//fin for
			} 
			else if(garantia=='prendaria'){
				//Mostramos el encabezado
				$("#head-fiduciario").hide();
				$("#head-hipotecario").hide();
				$("#head-prendario_vehiculo").hide();
				$("#head-prendario_maquinaria").hide();
				$("#head-prendario_ahorro").hide();
				$('#ul_detalleVehiculos_list').html("");
				$('#ul_detalleMaquinaria_list').html("");
				$('#ul_detalleAhorro_list').html("");
				//ingresamos los valores
				fidu_prendarias = [];
				for(var i=0;i<len;i++){
					var row = results.rows.item(i);
					var info = $.parseJSON(row['FORM_RESPONSE']);
					if(info.cb_pren_tipoGaranPrendaria==3){
						$("#head-prendario_vehiculo").show();
						if($.inArray(info.txt_pren_vehMarca+'-'+info.txt_pren_vehModelo+'-'+info.txt_pren_vehPlaca,fidu_prendarias) == -1){
							html  = '<tr>';
							html += '<td>'+row['ID']+'</td>';
							html += '<td>'+info.txt_pren_vehMarca.toUpperCase()+'</td>';
							html += '<td>'+info.txt_pren_vehModelo.toUpperCase()+'</td>';
							html += '<td>'+info.txt_pren_vehPlaca.toUpperCase()+'</td>';
							html += '<td>L. '+info.txt_pren_vehValorAvaluo+'</td>';
							html += '<td width="16%"><img src="images/bot-seleccionar.png" onclick="llenarSolicitud('+row['ID']+', 7, 1);return false;"/></td></tr>';	
							$('#ul_detalleVehiculos_list').append(html);
							fidu_prendarias.push(info.txt_pren_vehMarca+'-'+info.txt_pren_vehModelo+'-'+info.txt_pren_vehPlaca);
						}
					}
					if(info.cb_pren_tipoGaranPrendaria==4){
						$("#head-prendario_maquinaria").show();
						if($.inArray(info.cb_pren_maqTipoBien+'-'+info.txt_pren_maqMontoCobertura,fidu_prendarias) == -1){
							html  = '<tr>';
							html += '<td>'+row['ID']+'</td>';
							html += '<td>'+$("#cb_pren_maqTipoBien").find('option[value='+info.cb_pren_maqTipoBien+']').text()+'</td>';
							html += '<td>L. '+info.txt_pren_maqMontoCobertura+'</td>';
							html += '<td width="16%"><img src="images/bot-seleccionar.png" onclick="llenarSolicitud('+row['ID']+', 7, 1);return false;"/></td></tr>';	
							$('#ul_detalleMaquinaria_list').append(html);
							fidu_prendarias.push(info.cb_pren_maqTipoBien+'-'+info.txt_pren_maqMontoCobertura);
						}
					}
					if(info.cb_pren_tipoGaranPrendaria==6) {
						$("#head-prendario_ahorro").show();
						if($.inArray(info.txt_pren_AhoNombrePropietario+'-'+info.txt_pren_AhoNumDocumento,fidu_prendarias) == -1){
							html  = '<tr>';
							html += '<td>'+row['ID']+'</td>';
							html += '<td>'+$("#cb_pren_AhoClaseGarantia").find('option[value='+info.cb_pren_AhoClaseGarantia+']').text()+'</td>';
							html += '<td>'+(info.txt_pren_AhoNombrePropietario==null?' ':info.txt_pren_AhoNombrePropietario.toUpperCase())+'</td>';
							html += '<td>'+info.txt_pren_AhoNumDocumento+'</td>';
							html += '<td>L. '+info.txt_pren_AhoSaldoCuenta+'</td>';
							html += '<td width="16%"><img src="images/bot-seleccionar.png" onclick="llenarSolicitud('+row['ID']+', 7, 1);return false;"/></td></tr>';	
							$('#ul_detalleAhorro_list').append(html);
							fidu_prendarias.push(info.txt_pren_AhoNombrePropietario+'-'+info.txt_pren_AhoNumDocumento);
						}
					}
				}//fin for
			}
		});
	}, app.webdb.onError);
}

function llenarClienteSesion(idCliente){
	app.hdh.verificarLogin(1);
	var db = app.webdb.db;
	var html = "";
	db.transaction(function(tx){
		tx.executeSql("SELECT ID,FORM_RESPONSE FROM STORAGE WHERE CUSTOMER_REQUESTS = ? and form = 1",[idCliente],function(tx,results){
			var len = results.rows.length;
			for(var i=0;i<len;i++){
				var row = results.rows.item(i);
				var jsonR = JSON.parse(row['FORM_RESPONSE'].replace(new RegExp('\r?\n','g'), '\\r\\n'));
				prevsel = 0;
				prevciiu = 0;
				prevciiu2 = 0;
				prevciiu3 = 0;
				$.each(jsonR,function(input, value){
					if(input != 'idFormulario'){
						if(input.indexOf("txt_") != -1) {
							$('#'+input).val(value);
						} else if(input.indexOf("cb_") != -1) {							
							//console.log('#'+input+' option[value='+value+']');
							 if(input == "cb_municipio" ) {
								cargarMuni($('#cb_departamento').find('option:selected').val(), "#"+input, value);
								prevsel = value;
							} else if(input == "cb_aldea" ) {
							    cargarAldea(prevsel, $('#cb_departamento').find('option:selected').val(), "#"+input, value);
							    prevesel = 0;
							}  else if(input == "cb_ciiu_sector"){
								$('#'+input+' option').removeAttr('selected').filter('[value='+value+']').attr('selected', true);
								$('#'+input).selectmenu('refresh', true);
								prevciiu = value;
							} else if(input == "cb_ciiu_subsector"){
								cargarSubsectores(prevciiu, value);
								prevciiu2 = value;
							} else if(input == "cb_ciiu_rama"){
								cargarRamas(prevciiu, prevciiu2, value);
								prevciiu3 = value;
							}  else if(input == "cb_ciiu_clase"){
								cargarClases(prevciiu, prevciiu2, prevciiu3, value);
								prevciiu = 0;
								prevciiu2 = 0;
								prevciiu3 = 0;
							} else {
								$('#'+input+' option').removeAttr('selected').filter('[value='+value+']').attr('selected', true);
								$('#'+input).selectmenu('refresh', true);
							}
						} else if(input.indexOf("img_") != -1) {
							if(value.length > 0){
								$('#'+input.substring(0,input.length-3)).attr('src','data:image/jpeg;base64,' + value);
								$('#'+input).val(value);
							}else{
								$('#'+input).attr('src','');
							}							
						} else if(input.indexOf("hd_") != -1){
							$('#'+input).val(value);
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
						} else if($('#'+row['ID_IMG']+'_hd').val() != ""){
							$('#'+row['ID_IMG']).attr('src','data:image/jpeg;base64,' + $('#'+row['ID_IMG']+'_hd').val());
						}
					}//fin for					
				});
			}//fin for
			clientGlobal = new Cliente();
			clientGlobal.cargarDatos(idCliente);//toma los valores de los input's
			console.log(clientGlobal.getId());
			//-----------llenar los formularios
			$('#txt_aho_noIdentidad').val(clientGlobal.getNoIdentidad());
			$('#txt_aho_nombre').val(clientGlobal.getNombreCompleto());
			$('#txt_aho_codCliente').val(clientGlobal.getId());
			
			$('#txt_desPlazos_noIdentidad').val(clientGlobal.getNoIdentidad());
			$('#txt_desPlazos_nombre').val(clientGlobal.getNombreCompleto());
			$('#txt_desPlazos_codCliente').val(clientGlobal.getId());
			
			$('#txt_cred_noIdentidad').val(clientGlobal.getNoIdentidad());
			$('#txt_cred_nombre').val(clientGlobal.getNombreCompleto());
			$('#txt_cred_codCliente').val(clientGlobal.getId());
			
			$('#txt_solf_noIdentidad').val(clientGlobal.getNoIdentidad());
			$('#txt_solf_nombre').val(clientGlobal.getNombreCompleto());
			$('#txt_solf_codCliente').val(clientGlobal.getId());
			
			$('#txt_hipo_noIdentidad').val(clientGlobal.getNoIdentidad());
			$('#txt_hipo_nombre').val(clientGlobal.getNombreCompleto());
			$('#txt_hipo_codCliente').val(clientGlobal.getId());
			
			$('#txt_pren_noIdentidad').val(clientGlobal.getNoIdentidad());
			$('#txt_pren_nombre').val(clientGlobal.getNombreCompleto());
			$('#txt_pren_codCliente').val(clientGlobal.getId());
			
			$('#txt_rem_noIdentidad').val(clientGlobal.getNoIdentidad());
			$('#txt_rem_nombre').val(clientGlobal.getNombreCompleto());
			$('#txt_rem_codCliente').val(clientGlobal.getId());
			
			$('#txt_evalfin_noIdentidad').val(clientGlobal.getNoIdentidad());
			$('#txt_evalfin_nombre').val(clientGlobal.getNombreCompleto());
			$('#txt_evalfin_codCliente').val(clientGlobal.getId());
			
			$('#txt_reso_noIdentidad').val(clientGlobal.getNoIdentidad());
			$('#txt_reso_nombre').val(clientGlobal.getNombreCompleto());
			$('#txt_reso_codCliente').val(clientGlobal.getId());
			
			$('#txt_fac_nombre').val(clientGlobal.getNombreCompleto());
			$('#txt_fac_identidad').val(clientGlobal.getNoIdentidad());
			$('#txt_fac_usuario').val(userLoginGlobal.getNombre());
			$('#txt_fac_fecha').val(formatDate(new Date()));
			
			//-------------
			//limpiamos filtros de busqueda.
			$( "#txt_findCliente" ).val("");
			$( "#txt_fidu_findCliente" ).val("");
			
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
						
						if(cant_creditos > 0) {
							$('#sol_credit_ing').parent().wrap('<a id="prodLstCrd" data-stype="credito" onclick="irOpcion(\'client_product_list\',false, this);return false;"></a>');
						}
						if(cant_ahorro > 0) {
							$('#sol_cue_ahorro').parent().wrap('<a id="prodLstAho" data-stype="ahorro" onclick="irOpcion(\'client_product_list\',false, this);return false;"></a>');
						}
						if(cant_depPlazo > 0) {
							$('#sol_depos').parent().wrap('<a id="prodLstDep" data-stype="deposito" onclick="irOpcion(\'client_product_list\',false, this);return false;"></a>');
						}
						if(cant_remesas > 0) {
							$('#sol_remesas').parent().wrap('<a id="prodLstRem" data-stype="remesa" onclick="irOpcion(\'client_product_list\',false, this);return false;"></a>');
						}
					});
				},function(){},//error
				function(){//exito
					irOpcion('productos');	
				});
				break;
			case 3:
				irOpcion('facturacion');
				break;
			case 4:
				irOpcion('remesas');
				break;
			}//fin switch
		});
	}, app.webdb.onError);
}

function llenarSolicitud(idSolicitud, idForm, nuevo) {
	app.hdh.verificarLogin(1);
	var db = app.webdb.db;
	var html = "";
	db.transaction(function(tx){
		tx.executeSql("SELECT ID, FORM, FORM_RESPONSE FROM STORAGE WHERE ID = ?",[idSolicitud],function(tx,results){
			var len = results.rows.length;
			var idformulario = results.rows.item(0);
			for(var i=0;i<len;i++){
				var row = results.rows.item(i);
				var jsonR = JSON.parse(row['FORM_RESPONSE'].replace(new RegExp('\r?\n','g'), '\\r\\n'));
				prevsel = 0;
				prevciiu = 0;
				prevciiu2 = 0;
				prevcred = 0;
				$.each(jsonR,function(input, value){
					if(input != 'idFormulario'){
						if(idForm == 1) {
							input = input.replace("txt_","txt_fidu_");
							input = input.replace("cb_","cb_fidu_");
							input = input.replace("hd_","hd_fidu_");
							input = input.replace("img_","img_fidu_");
						}
						if(input.indexOf("txt_") != -1){
							if($('#'+input).hasClass('format_number')) {
								$('#'+input).val(value.replace(",",""));
							} else {
								$('#'+input).val(value);
							}
						} else if(input.indexOf("chk_") != -1) {
							if(value == "1"){
								$('#'+input).attr("checked",true);
								$('#'+input).checkboxradio('refresh');
							}
						} else if(input.indexOf("cb_") != -1){
							//console.log('#'+input+' option[value='+value+']');
							if(input == "cb_fidu_municipio" || input == "cb_hipo_municipio"){
								divId = (input == "cb_fidu_municipio")?"#cb_fidu_departamento":"#cb_hipo_departamento";
								cargarMuni($(divId).find('option:selected').val(), "#"+input, value);
								prevsel = value;
							} else if(input == "cb_fidu_aldea" || input == "cb_hipo_aldea"){
								parId = (input == "cb_fidu_aldea")?"#cb_fidu_departamento":"#cb_hipo_departamento";
								divId = (input == "cb_fidu_aldea")?"#cb_fidu_municipio":"#cb_hipo_municipio";
								cargarAldea(prevsel, $(parId).find('option:selected').val(), "#"+input, value);
								prevsel = 0;
							} else if(input == "cb_ciiu_sector"){
								cargarSubsectores($("#"+input).find('option:selected').val(), value);
								prevciiu = value;
							} else if(input == "cb_ciiu_subsector"){
								cargarRamas(prevciiu, $("#"+input).find('option:selected').val(), value);
								prevciiu2 = value;
							} else if(input == "cb_ciiu_rama"){
								cargarClases(prevciiu, prevciiu2, $("#"+input).find('option:selected').val(), value);
								prevciiu = 0;
								prevciiu2 = 0;
							} else if(input == "cb_cred_rubro"){
								cargarRubros($("#cb_cred_destino").find('option:selected').val(), value);
								prevcred = value;
							} else if(input == "cb_cred_actEspecifica"){
								cargarActividadesEspecificas(prevcred, $("#cb_cred_destino").find('option:selected').val(), value);
								prevcred = 0;
							} else {
								$('#'+input+' option').removeAttr('selected').filter('[value='+value+']').attr('selected', true);
								$('#'+input).selectmenu('refresh');
							}
						} else if(input.indexOf("img_") != -1) {
							if(value.length > 0){
								$('#'+input.substring(0,input.length-3)).attr('src','data:image/jpeg;base64,' + value);
								$('#'+input).val(value);
							}else{
								$('#'+input).attr('src','');
							}							
						} else if(input.indexOf("hd_") != -1){
							$('#'+input).val(value);
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
						} else if($('#'+row['ID_IMG']+'_hd').val() != ""){
							$('#'+row['ID_IMG']).attr('src','data:image/jpeg;base64,' + $('#'+row['ID_IMG']+'_hd').val());
						}
					}//fin for					
				});
			}//fin for
			
			if(typeof nuevo == 'undefined'){
				if(idForm==1)
				{
					if ($('#editForm5').length){
						$('#editForm5').val(idformulario['ID']);
					} else {
						var ubi = obtenerDivForm(5);
						$('<input type="hidden" name="editForm5" id="editForm5" value="'+idformulario['ID']+'" />').insertBefore(ubi);
					}

				} else {
					if ($('#editForm'+idformulario['FORM']).length){
						$('#editForm'+idformulario['FORM']).val(idformulario['ID']);
					} else {
						var ubi = obtenerDivForm(idformulario['FORM']);
						$('<input type="hidden" name="editForm'+idformulario['FORM']+'" id="editForm'+idformulario['FORM']+'" value="'+idformulario['ID']+'" />').insertBefore(ubi);
					}
				}
			}
			//una vez cargado los valores, se deben de llevar al formulario requerido
			switch (idformulario['FORM']) {
			case 2:				
				$("#credId_gtia_fidu").val(idformulario['ID']);
				$("#credId_gtia_hipo").val(idformulario['ID']);
				$("#credId_gtia_pren").val(idformulario['ID']);
				$("#credId_eval_fin").val(idformulario['ID']);
				$("#credId_resolucion").val(idformulario['ID']);
				if($('#editForm'+idformulario['FORM']).length && $('#editForm'+idformulario['FORM']).val() != 0) {
					mostrarGarantias(idformulario['ID']);
				}
				irOpcion('creditos');	
				break;
			case 3:
				irOpcion('ahorros');	
				break;
			case 4:
				irOpcion('depositosPlazos');
				break;
			case 1:
				inhabilitarSelectFiduciario();
				irOpcion('fiduciario');
				break;
			case 6:
				irOpcion('hipotecaria');
				break;
			case 7:
				if(typeof nuevo == 'undefined'){
					$("#cb_pren_tipoGaranPrendaria").selectmenu('disable');
				} else {
					$("#cb_pren_tipoGaranPrendaria").selectmenu('enable');
				}
				irOpcion('prendaria');
				break;
			case 9:
				//Cargamos la informacion inicial
				cargarInformacion();
				
				//hacemos los calculos necesarios
				calculosBalance();
				calculosAnalisisCuota();
				calculoIndicadores();
				calculoCrecimiento();
				break;
			}//fin switch
		});
	}, app.webdb.onError);
}

function inhabilitarSelectFiduciario() {
	$.each($('#div_fiduciario select'), function(index, input){
		var myselect = $("#"+input.id);
		myselect.selectmenu("disable");
	});
	$("#txt_fidu_geoPosicion").button( "disable" );
	
	$('#div_fiduciario input[readonly="readonly"]').css({'background-color':'rgb(194, 192, 180)'});
	
	$('#div_fiduciario textarea[readonly="readonly"]').css({'background-color':'rgb(194, 192, 180)'});
}

function mostrarGarantias(idSolicitud) {
	var db = app.webdb.db;
	var html = "";
	var idCliente = clientGlobal.getId();
	db.transaction(function(tx){
		tx.executeSql("SELECT s.ID, FORM, FORM_RESPONSE FROM STORAGE s INNER JOIN GARANTIAS g ON g.ID_GAR=S.ID WHERE g.ID_SOL = ?",[idSolicitud],function(tx,results){
			var len = results.rows.length;
			if(len != 0) {
				var idformulario = results.rows.item(0);
				var gtia1 = '', gtia2 = "", gtia3 = "";
				for(var i=0;i<len;i++){
					var row = results.rows.item(i);
					var response = JSON.parse(row['FORM_RESPONSE'].replace(new RegExp('\r?\n','g'), '\\r\\n'));
					var prendas = ['','','','Vehicular','Maquinaria/Bienes','','Ahorros'];
					var inmuebles = ['','Solar','Solar y Casa','Terreno','Terreno y Casa'];
					if(response.idFormulario == 5 || response.idFormulario == 1) {
						gtia1 += '<li><a href="#" onclick="llenarSolicitud('+row['ID']+',1);" class="ui-btn ui-icon-carat-r ui-btn-icon-right">['+response.txt_noIdentidad+'] '+ response.txt_primerNombre;
						gtia1 += response.txt_segundoNombre==null?' ':response.txt_segundoNombre+' ';
						gtia1 += ' '+response.txt_primerApellido+' ';
						gtia1 += response.txt_segundoApellido==null?'</a></li>':response.txt_segundoApellido+'</a></li>';
					} else if(response.idFormulario  == 6) {
						gtia2 += '<li><a href="#" onclick="llenarSolicitud('+row['ID']+');" class="ui-btn ui-icon-carat-r ui-btn-icon-right">['+inmuebles[response.cb_hipo_tipoInmueble]+'] Numero: '+response.txt_hipo_numero+' Tomo: '+response.txt_hipo_tomo+' - '+response.txt_hipo_propietarioInmueble+' '+response.txt_hipo_primerApellido+' '+response.txt_hipo_segundoApellido+'</a></li>';
					} else if(response.idFormulario  == 7) {
						nombre = response.cb_pren_tipoGaranPrendaria=="6"?response.txt_pren_AhoNombrePropietario:response.txt_pren_nombre;
						gtia3 += '<li><a href="#" onclick="llenarSolicitud('+row['ID']+');" class="ui-btn ui-icon-carat-r ui-btn-icon-right">Prenda '+ prendas[response.cb_pren_tipoGaranPrendaria]+' - '+nombre+'</a></li>';
					}
				}//fin for
				$("#tbl_cred_garan_fiduciarios").html(gtia1);
				$("#tbl_cred_garan_hipotecaria").html(gtia2);
				$("#tbl_cred_garan_prendaria").html(gtia3);
				//cargamos el listview de las garantias
				$("#warrantReview").listview({create: function( event, ui ) {} });
				$("#warrantReview").listview("refresh");
			}
		});
		db.transaction(function(tx){
			tx.executeSql("SELECT COUNT(FORM) FIDUCIARIO,(SELECT COUNT(FORM) FROM STORAGE s INNER JOIN GARANTIAS g ON g.ID_GAR=S.ID WHERE g.ID_SOL = ? AND CUSTOMER_REQUESTS = ? AND FORM = 6) HIPOTECARIO,(SELECT COUNT(FORM) FROM STORAGE s INNER JOIN GARANTIAS g ON g.ID_GAR=S.ID WHERE g.ID_SOL = ? AND CUSTOMER_REQUESTS = ? AND FORM = 7) PRENDARIO FROM STORAGE s INNER JOIN GARANTIAS g ON g.ID_GAR=S.ID WHERE g.ID_SOL = ? AND FORM = 1",[idSolicitud,idCliente,idSolicitud,idCliente,idSolicitud],function(tx,results){
				var cant_fidu = results.rows.item(0).FIDUCIARIO;
				var cant_hipo = results.rows.item(0).HIPOTECARIO;
				var cant_pren = results.rows.item(0).PRENDARIO;
				
				$("#tbl_cred_garan_fiduciarios").parent().parent().find('h2').find('a').find('span').html(cant_fidu);
				$("#tbl_cred_garan_hipotecaria").parent().parent().find('h2').find('a').find('span').html(cant_hipo);
				$("#tbl_cred_garan_prendaria").parent().parent().find('h2').find('a').find('span').html(cant_pren);
			});
		},function(){});
	}, app.webdb.onError);
}

function verificarEvalResLlena(idForm) {
	var db = app.webdb.db;
	var html = "";
	var idCliente = clientGlobal.getId();
	var idSolicitud = (idForm==9)?$("#credId_eval_fin").val():$("#credId_resolucion").val();
	db.transaction(function(tx){
			tx.executeSql("SELECT ID, FORM, FORM_RESPONSE FROM STORAGE WHERE FORM=? and CUSTOMER_REQUESTS = ?", [idForm, clientGlobal.getId()],function(tx,results){
				var len = results.rows.length;
				if(len != 0) {
					var idformulario = results.rows.item(0);
					llenarSolicitud(idformulario['ID']);
				}
			});
		},function(){});
}

function sumarEvaluaciones(){
	var total = 0;
	if($("#TerrenoCasa").is(":visible")){
		total += ($('#txt_cap_areaCulCafe_man_tol').NumBox('getRaw').length==0?0:eval($('#txt_cap_areaCulCafe_man_tol').NumBox('getRaw')));
		total += ($('#txt_cap_areaGranos_man_tol').NumBox('getRaw').length==0?0:eval($('#txt_cap_areaGranos_man_tol').NumBox('getRaw')));
		total += ($('#txt_cap_areaPastos_man_tol').NumBox('getRaw').length==0?0:eval($('#txt_cap_areaPastos_man_tol').NumBox('getRaw')));
		total += ($('#txt_cap_areaGuamiles_man_tol').NumBox('getRaw').length==0?0:eval($('#txt_cap_areaGuamiles_man_tol').NumBox('getRaw')));
		total += ($('#txt_cap_areaHortaliza_man_tol').NumBox('getRaw').length==0?0:eval($('#txt_cap_areaHortaliza_man_tol').NumBox('getRaw')));
		total += ($('#txt_cap_areaFrutal_man_tol').NumBox('getRaw').length==0?0:eval($('#txt_cap_areaFrutal_man_tol').NumBox('getRaw')));
		total += ($('#txt_cap_areaBosque_man_tol').NumBox('getRaw').length==0?0:eval($('#txt_cap_areaBosque_man_tol').NumBox('getRaw')));
		total += ($('#txt_cap_areaLaguna_man_tol').NumBox('getRaw').length==0?0:eval($('#txt_cap_areaLaguna_man_tol').NumBox('getRaw')));
		if($("#CasaTerreno").is(":visible")) {
			total += ($('#txt_cap_areaCasa_man_tol').NumBox('getRaw').length==0?0:eval($('#txt_cap_areaCasa_man_tol').NumBox('getRaw')));
		}
	} 
	else if($("#SolarCasa").is(":visible")) {
		total += ($('#txt_cap_solCasa_areaSolar_man_tol').NumBox('getRaw').length==0?0:eval($('#txt_cap_solCasa_areaSolar_man_tol').NumBox('getRaw')));
		total += ($('#txt_cap_solCasa_casa1piso1_man_tol').NumBox('getRaw').length==0?0:eval($('#txt_cap_solCasa_casa1piso1_man_tol').NumBox('getRaw')));
		total += ($('#txt_cap_solCasa_casa1piso2_man_tol').NumBox('getRaw').length==0?0:eval($('#txt_cap_solCasa_casa1piso2_man_tol').NumBox('getRaw')));
		if($("#tbl_solarCasa_casa2").is(":visible")){
			total += ($('#txt_cap_solCasa_casa2piso1_man_tol').NumBox('getRaw').length==0?0:eval($('#txt_cap_solCasa_casa2piso1_man_tol').NumBox('getRaw')));
			total += ($('#txt_cap_solCasa_casa2piso2_man_tol').NumBox('getRaw').length==0?0:eval($('#txt_cap_solCasa_casa2piso2_man_tol').NumBox('getRaw')));
		}
		
		if($("#tbl_solarCasa_casa3").is(":visible")){
			total += ($('#txt_cap_solCasa_casa3piso1_man_tol').NumBox('getRaw').length==0?0:eval($('#txt_cap_solCasa_casa3piso1_man_tol').NumBox('getRaw')));
			total += ($('#txt_cap_solCasa_casa3piso2_man_tol').NumBox('getRaw').length==0?0:eval($('#txt_cap_solCasa_casa3piso2_man_tol').NumBox('getRaw')));
		}
		total += ($('#txt_cap_solCasa_areaAnexo_man_tol').NumBox('getRaw').length==0?0:eval($('#txt_cap_solCasa_areaAnexo_man_tol').NumBox('getRaw')));
		total += ($('#txt_cap_solCasa_areaInsta_man_tol').NumBox('getRaw').length==0?0:eval($('#txt_cap_solCasa_areaInsta_man_tol').NumBox('getRaw')));
		total += ($('#txt_cap_solCasa_areaMuroPer_man_tol').NumBox('getRaw').length==0?0:eval($('#txt_cap_solCasa_areaMuroPer_man_tol').NumBox('getRaw')));
	} 
	else {
		total += ($('#txt_cap_sol_areaSolar_man_tol').NumBox('getRaw').length==0?0:eval($('#txt_cap_sol_areaSolar_man_tol').NumBox('getRaw')));
		total += ($('#txt_cap_sol_areaMuro_man_tol').NumBox('getRaw').length==0?0:eval($('#txt_cap_sol_areaMuro_man_tol').NumBox('getRaw')));
		total += ($('#txt_cap_sol_areaInsta_man_tol').NumBox('getRaw').length==0?0:eval($('#txt_cap_sol_areaInsta_man_tol').NumBox('getRaw')));
	}
	$('#txt_cap_total_avaluo').NumBox('setRaw', total);
	$('#txt_cap_val_financiado').NumBox('setRaw', (total*0.6));
}

function calcularPlanInversion(){
	var totalCosto = 0;
	var total = 0;
	$("input[id*='txt_planInver_cant']").each(function(index, inputCant){
		var i = index + 1;
		var cant = Math.ceil($(inputCant).val());
		var costo = eval($('#txt_planInver_costUni'+i).NumBox('getRaw').length==0?0:$('#txt_planInver_costUni'+i).NumBox('getRaw'));
		totalCosto += costo;
		var subTotal = cant * costo;
		$('#txt_planInver_costoTotal'+i).NumBox('setRaw', subTotal);
		total += eval(subTotal);
	});
	$('#txt_planInver_totalCosto').NumBox('setRaw', totalCosto);
	$('#txt_planInver_costoTotal').NumBox('setRaw', total);
}

function limpiarForm(idDiv){
	//proceso de limpiar el formulario
	$.each($('#'+idDiv+' input[type!="button"]'), function(index, input){
		$(input).css({'background-color':'white' , "color":"black"});
		$(input).val("");
	});
	$.each($('#'+idDiv+' select'), function(index, select){
		$(select).parent().css({"background-color":"#009245"});
		$(select).val($(select).children('option:first').val());
		$(select).selectmenu('refresh');
	});
	$.each($('#'+idDiv+' textarea'), function(index, input){
		$(input).css('background-color','white');
		$(input).val("");
	});
	$.each($('#'+idDiv+' img[name^="img_"]'), function(index, input){
		$(input).attr("src","");
	});
	$.each($('#'+idDiv+' input[type="checkbox"]'), function(index, input){
		$(input).attr('checked',false).checkboxradio('refresh');
	});
	if ($('#'+idDiv).parent().find('input[id^="editForm"]').length){
		$('#'+idDiv).parent().find('input[id^="editForm"]').val(0);
	}
	//limpiamos el review de los creditos
	if(idDiv == 'div_datosCreditos'){
		$("#tbl_cred_garan_fiduciarios").html("");
		$("#tbl_cred_garan_fiduciarios").parent().parent().find('h2').find('a').find('span').html("0");
		$("#tbl_cred_garan_hipotecaria").html("");
		$("#tbl_cred_garan_hipotecaria").parent().parent().find('h2').find('a').find('span').html("0");
		$("#tbl_cred_garan_prendaria").html("");
		$("#tbl_cred_garan_prendaria").parent().parent().find('h2').find('a').find('span').html("0");
		//cargamos el listview de las garantias
		$("#warrantReview").listview({create: function( event, ui ) {} });
		$("#warrantReview").listview("refresh");
	}
	
	$('#'+idDiv+' #div_evaluacionCaptura').collapsible("collapse");
	
	$("#txt_fidu_findCliente").val("");
	$("#txt_findCliente").val("");
}

function guardarFormulario(idDiv){
	app.hdh.verificarLogin(1);
	var jsonText;
	var idForm;
	var flag = 0;//0 todas los campos son validos
	var nomForm = '';
	//alert('En construccion, guardarFormulario('+idDiv+')');	
	//validar los input requeridos
	//style="border:0px none rgb(51, 51, 51)"<--valor defecto
	$.each($('#'+idDiv+' input[required="required"]'), function(index, input){
		if(input.value.trim().length == 0){
			$(input).css({'background-color':'red', "color":"white"});
			flag = 1;
		} else {//retornar el estilo a lo normal
			$(input).css({'background-color':'white', "color":"black"});
		}
	});
	$.each($('#'+idDiv+' select[required="required"]'), function(index, input){
		var myselect = $("#"+input.id);
		if(myselect[0].selectedIndex == 0){
			myselect.selectmenu("refresh");
			myselect.parent().css({"background-color":"red"});
			flag = 1;
		} else {
			myselect.parent().css({"background-color":"#009245"});
		}
	});
	if(idDiv == 'div_datosGenerales'){
		idForm = 1;
	}
	else if(idDiv == 'div_datosCreditos'){
		idForm = 2;
		nomForm = 'creditos';
	}
	else if(idDiv == 'div_ahorros'){
		idForm = 3;
		nomForm = 'ahorros';
	}
	else if(idDiv == 'div_depositosPlazo'){
		idForm = 4;
		nomForm = 'depositos a plazo';
	}
	else if(idDiv == 'div_fiduciario'){
		if($("#txt_fidu_total").NumBox("getRaw") <= 0 ){
			$("#txt_fidu_total").css({'background-color':'red', "color":"white"});
			flag = 1;
		} else {//retornar el estilo a lo normal
			$("#txt_fidu_total").css({'background-color':'rgb(194, 192, 180)', "color":"black"});
		}
		if($("#txt_fidu_totalIngresos").NumBox("getRaw") <= 0){
			$("#txt_fidu_totalIngresos").css({'background-color':'red', "color":"white"});
			flag = 1;
		} else {//retornar el estilo a lo normal
			$("#txt_fidu_totalIngresos").css({'background-color':'rgb(194, 192, 180)', "color":"black"});
		}
		idForm = 5;
	}
	else if(idDiv == 'div_hipotecaria'){
		if($("#txt_cap_total_avaluo").NumBox("getRaw") <= 0){
			$("#txt_cap_total_avaluo").css({'background-color':'red', "color":"white"});
			flag = 1;
		} else {//retornar el estilo a lo normal
			$("#txt_cap_total_avaluo").css({'background-color':'white', "color":"black"});
		}
		idForm = 6;
	}
	else if(idDiv == 'div_prendaria') {
		idForm = 7;
	}
	else if(idDiv == 'div_remesas'){
		idForm = 8;	
		nomForm = 'remesas';
	}
	else if(idDiv == 'div_evalFinanciera'){
		idForm = 9;	
	}
	else if(idDiv == 'div_resolucion'){
		idForm = 10;	
	}	
	//obtener los id y sus valores al ser almacenados en la base
	if(flag == 0){//todos los input son validos
		jsonText = '{"idFormulario":"'+idForm+'",';
		//recorrido de los input
		$.each($('#'+idDiv+' input[type!="button"]'), function(index, input){
			var campo = input.id;
			if(idDiv == 'div_fiduciario'){
				campo = campo.replace("txt_fidu_","txt_");
			}
			if(campo.indexOf("img_") != -1) {
				jsonText += '"'+campo+'":"'+input.value+'",';
			} else {
				jsonText += '"'+campo+'":"'+input.value.toUpperCase().replace(/\"/g, "\\\"")+'",';
			}
			//console.log(index + ")Id:"+input.id+", VALUE: " + input.value);
		});
		//recorrido de los combo box
		$.each($('#'+idDiv+' select'), function(index, select){
			var seleccion = select.id
			if(idDiv == 'div_fiduciario'){
				seleccion = seleccion.replace("cb_fidu_","cb_");
			}
			jsonText += '"'+seleccion+'":"'+select.value+'",';
			//console.log(index + ")Id:"+select.id+", VALUE: " + select.value);
		});
		//recorrido de los text area
		$.each($('#'+idDiv+' textarea'), function(index, textarea){
			var texto = textarea.id;
			if(idDiv == 'div_fiduciario'){
				texto = texto.replace("txt_fidu_","txt_");
				
			}
			jsonText += '"'+texto+'":"'+textarea.value.replace(/\"/g, "\\\"").replace(new RegExp('\r?\n','g'), '\\r\\n')+'",';
			//console.log(index + ")Id:"+select.id+", VALUE: " + select.value);
		});
		//recorrido de las facturas cuando aplica
		if(idDiv == 'div_facturacion'){
			idForm = 666;
			var flag_fac = 1;
			var index_cod;
			var campo_fac;
			$.each($('#details tr[id!="nothing"] td'), function(index, tdText){
				if(flag_fac == 5)
					flag_fac = 1;
				if(flag_fac == 1){
					index_cod = $(tdText).text();
					campo_fac = 'codigo'+'_'+index_cod;
				}else if(flag_fac == 2){
					campo_fac = 'transaccion'+'_'+index_cod;
				}else if(flag_fac == 3){
					campo_fac = 'num_cuenta'+'_'+index_cod;
				}else if(flag_fac == 4){
					campo_fac = 'valor'+'_'+index_cod;
				}
				jsonText += '"'+campo_fac+'":"'+$(tdText).text()+'",';
				flag_fac++;
				//console.log(index + ")Text: " + $(tdText).text());
			});
		}
		jsonText = jsonText.substr(0,jsonText.length-1);
		jsonText += '}';
		//console.log(jsonText);
		//almacenar en la base de datos
		var db = app.webdb.db;
		var insert = "INSERT INTO STORAGE(FORM,FORM_RESPONSE,DATE_CREATED,DATE_UPDATED, ID_DIV,CUSTOMER_REQUESTS) VALUES(?,?,strftime('%Y-%m-%d %H:%M:%S','now','localtime'),strftime('%Y-%m-%d %H:%M:%S','now','localtime'),?,?)";
		//llenar el objeto cliente.
		if(idDiv == 'div_datosGenerales'){
			if($("#img_cliente_firma_hd").val().length==0 && $("#img_cliente_iden_frontal_hd").val().length==0 && $("#img_cliente_iden_trasera_hd").val().length==0)
			{
				alert('No se han ingresado las capturas');
			} else {
				db.transaction(function(tx){
					tx.executeSql("SELECT ID_CAP_CUSTOMER, FORM_RESPONSE FROM CAP_CUSTOMER c INNER JOIN STORAGE s ON c.ID_CAP_CUSTOMER=S.CUSTOMER_REQUESTS WHERE FORM=1 AND TYPE_IDENTITY = ? AND IDENTITY = ?",[$('#cb_tipoIdentificacion').find('option:selected').val(),$('#txt_noIdentidad').val()],
						function(tx,results){
							var len = results.rows.length;
							if(len != 0){//update cliente
								var prow = results.rows.item(0);
								var response = JSON.parse(prow['FORM_RESPONSE'].replace(new RegExp('\r?\n','g'), '\\r\\n'));
								var jsonR = JSON.parse(jsonText);
								var jsonResult = {};
								$.each(response, function(input, value){
									if (typeof jsonResult[input] == 'undefined') {
										jsonResult[input] = value;
									}
								});
								$.each(jsonR, function(input, value){
									if (typeof jsonResult[input] == 'undefined') {
										jsonResult[input] = value;
									} else {
										if(jsonResult[input] != value){
											jsonResult[input] = value;
										}
									}
								});
								
								var updateCap = "UPDATE CAP_CUSTOMER SET firstname=?,midname=?,lastname1=?,lastname2=?,gender=?,birthday=?,nationality=?,ocupation=?,education=?, patrimony=?, DATE_UPDATED=strftime('%Y-%m-%d %H:%M:%S','now','localtime') WHERE ID_CAP_CUSTOMER = ?";
								tx.executeSql(updateCap,[$('#txt_primerNombre').val(),$('#txt_segundoNombre').val(),$('#txt_primerApellido').val(),$('#txt_segundoApellido').val(),$('#cb_tipoSexo').find('option:selected').val(),$('#txt_fechaNacimiento').val(),$('#txt_nacionalidad').val(),$('#cb_profecion').find('option:selected').val(),$('#cb_nivelEducativo').find('option:selected').val(),$('#hd_patrimonio').val(), clientGlobal.getId()]);
								var updCliente = "UPDATE STORAGE SET FORM_RESPONSE = ?, DATE_UPDATED = strftime('%Y-%m-%d %H:%M:%S','now','localtime') WHERE CUSTOMER_REQUESTS = ? AND FORM = 1";
								tx.executeSql(updCliente,[JSON.stringify(jsonResult),clientGlobal.getId()],function(tx,results){
									$.each($('#'+idDiv+' img'), function(index, img){
										tx.executeSql("UPDATE FOTOS SET FOTO = ? WHERE ID_FOTO = (SELECT ID_FOTO FROM FOTOS WHERE ID_STORAGE = (SELECT ID FROM STORAGE WHERE CUSTOMER_REQUESTS = ? AND FORM = 1) AND ID_IMG = ?)",[$('#'+img.id+'_hd').val(),clientGlobal.getId(),img.id]);
									});
									alert("La informacion del "+clientGlobal.getNombreCompleto()+" fue modificada, exitosamente.");
									//limpiamos el formulario
									limpiarForm(idDiv);
									irOpcion('clientes_list');
								});
							} else {
								//insertar nuevo cliente
								clientGlobal = new Cliente();
								var insCliente = "INSERT INTO cap_customer(firstname,midname,lastname1,lastname2,type_identity,identity,gender,birthday,status,nationality,ocupation,education,patrimony, active,date_created, DATE_UPDATED, AGENCIA) ";
								insCliente += "VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,strftime('%Y-%m-%d %H:%M:%S','now','localtime'),strftime('%Y-%m-%d %H:%M:%S','now','localtime'), ?)";
								tx.executeSql(insCliente,[$('#txt_primerNombre').val().toUpperCase(),$('#txt_segundoNombre').val().toUpperCase(),$('#txt_primerApellido').val().toUpperCase(),$('#txt_segundoApellido').val().toUpperCase(),$('#cb_tipoIdentificacion').find('option:selected').val(),$('#txt_noIdentidad').val(),$('#cb_tipoSexo').find('option:selected').val(),$('#txt_fechaNacimiento').val(),1,$('#txt_nacionalidad').val().toUpperCase(),$('#cb_profecion').find('option:selected').val(),$('#cb_nivelEducativo').find('option:selected').val(),$('#hd_patrimonio').val(),1, userLoginGlobal.getCompanyId()],
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
											//limpiamos el formulario
											limpiarForm(idDiv);
											
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
											
											$('#mt_patrimonio').NumBox('setRaw',clientGlobal.getPatrimonio());
											irOpcion('msgExitos');
										},app.webdb.onError);
									}//fin result
								);
							}
						}//fin tx,results
					);
				},app.webdb.onError);
			}
		}
		else if(idDiv == 'div_fiduciario'){
			if($("#img_fidu_cliente_firma_hd").val().length==0 && $("#img_fidu_cliente_iden_frontal_hd").val().length==0 && $("#img_fidu_cliente_iden_trasera_hd").val().length==0)
			{
				alert('El aval no tiene capturas actualize el perfil.');
			} else {
				db.transaction(function(tx){
					tx.executeSql("SELECT ID_CAP_CUSTOMER, FORM_RESPONSE FROM CAP_CUSTOMER c INNER JOIN STORAGE s ON c.ID_CAP_CUSTOMER=S.CUSTOMER_REQUESTS WHERE FORM=1 AND TYPE_IDENTITY = ? AND IDENTITY = ?",[$('#cb_fidu_tipoIdentificacion').find('option:selected').val(),$('#txt_fidu_noIdentidad').val()],
						function(tx,results){
							var len = results.rows.length;
							if(len != 0){//update cliente
								var prow = results.rows.item(0);
								fidu_id = prow["ID_CAP_CUSTOMER"];
								var response = JSON.parse(prow['FORM_RESPONSE'].replace(new RegExp('\r?\n','g'), '\\r\\n'));
								var jsonR = JSON.parse(jsonText);
								var jsonResult = {};
								$.each(response, function(input, value){
									if (typeof jsonResult[input] == 'undefined') {
										jsonResult[input] = value;
									}
								});
								$.each(jsonR, function(input, value){
									if (typeof jsonResult[input] == 'undefined') {
										jsonResult[input] = value;
									} else {
										if(jsonResult[input] != value){
											jsonResult[input] = value;
										}
									}
								});
								
								var updateCap = "UPDATE CAP_CUSTOMER SET firstname=?,midname=?,lastname1=?,lastname2=?,gender=?,birthday=?,nationality=?,ocupation=?,education=?, patrimony=? WHERE ID_CAP_CUSTOMER = ?";
								tx.executeSql(updateCap,[$('#txt_fidu_primerNombre').val(),$('#txt_fidu_segundoNombre').val(),$('#txt_fidu_primerApellido').val(),$('#txt_fidu_segundoApellido').val(),$('#cb_fidu_tipoSexo').find('option:selected').val(),$('#txt_fidu_fechaNacimiento').val(),$('#txt_fidu_nacionalidad').val(),$('#cb_fidu_profecion').find('option:selected').val(),$('#cb_fidu_nivelEducativo').find('option:selected').val(),$('#hd_fidu_patrimonio').val(), fidu_id]);
								var updCliente = "UPDATE STORAGE SET FORM_RESPONSE = ?, DATE_UPDATED = strftime('%Y-%m-%d %H:%M:%S','now','localtime') WHERE CUSTOMER_REQUESTS = ? AND FORM = 1";
								tx.executeSql(updCliente,[JSON.stringify(jsonResult),fidu_id],function(tx,results){
									var id_garantia = $('#editForm'+idForm).val();
									var id_solicitud = $("#credId_gtia_fidu").val();
									tx.executeSql("SELECT * FROM GARANTIAS WHERE ID_SOL=? AND ID_GAR=? ", [id_solicitud,id_garantia], function(tx, results){
										var len = results.rows.length;
										if(len == 0){
											tx.executeSql("INSERT INTO GARANTIAS(ID_SOL,ID_GAR,STATE,ID_USER,DATE_CREATED) VALUES(?,?,1,?,strftime('%Y-%m-%d %H:%M:%S','now','localtime'))",[id_solicitud,id_garantia,userLoginGlobal.getUserid()]);
										}									
									});
									
									$.each($('#'+idDiv+' img'), function(index, img){
										tx.executeSql("UPDATE FOTOS SET FOTO = ? WHERE ID_FOTO = (SELECT ID_FOTO FROM FOTOS WHERE ID_STORAGE = (SELECT ID FROM STORAGE WHERE CUSTOMER_REQUESTS = ? AND FORM = 1) AND ID_IMG = ?)",[$('#'+img.id+'_hd').val(),clientGlobal.getId(),img.id]);
									});
									//limpiar el formulario
									limpiarForm(idDiv);
									mostrarGarantias($("#credId_gtia_fidu").val());		
									alert("El formulario se actualizo exitosamente.");
									irOpcion('creditos');
								});
							}
						}//fin tx,results
					);
				},app.webdb.onError);
			}
		}
		else {//else de div_fiduciario
			if(idForm == 5 || idForm == 6 || idForm == 7 || idForm == 9 || idForm == 10) {
				var fid = 0;
				var combo = $("#cb_cred_producto").find("option:selected");
			 	idProd = combo.val();
				if(idForm ==5 ) {
					fid = $("#credId_gtia_fidu").val();
				} else if(idForm == 6) {
					fid = $("#credId_gtia_hipo").val();
				} else if(idForm == 7) {
					fid = $("#credId_gtia_pren").val();
				} else if(idForm == 9) {
					fid = $("#credId_eval_fin").val();
				} else if(idForm == 10) {
					fid = $("#credId_resolucion").val();
				}
				
				if($('#editForm'+idForm).length && $('#editForm'+idForm).val() > 0){
					db.transaction(function(tx){
						update = "UPDATE STORAGE SET FORM_RESPONSE = ?, DATE_UPDATED = strftime('%Y-%m-%d %H:%M:%S','now','localtime') WHERE ID = ? ";
						tx.executeSql(update,[jsonText, $('#editForm'+idForm).val()],function(tx, results){
							var id_storage = $('#editForm'+idForm).val();
							tx.executeSql("SELECT * FROM GARANTIAS WHERE ID_SOL=? AND ID_GAR=? ",[fid,id_storage], function(tx, results){
								var len = results.rows.length;
								if(len == 0){
									tx.executeSql("INSERT INTO GARANTIAS(ID_SOL,ID_GAR,STATE,ID_USER,DATE_CREATED) VALUES(?,?,1,?,strftime('%Y-%m-%d %H:%M:%S','now','localtime'))",[fid,id_storage,userLoginGlobal.getUserid()]);
								}
							});
							//recorrido de las imagenes
							$.each($('#'+idDiv+' img'), function(index, img){
								tx.executeSql("INSERT INTO FOTOS(ID_IMG,FOTO,ID_STORAGE) VALUES(?,?,?)",[img.id,$('#'+img.id+'_hd').val(),id_storage]);
							});
							mostrarGarantias(fid);
						});
					},app.webdb.onError, function() {
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
						$.each($('#'+idDiv+' textarea'), function(index, input){
							$(input).val("");
						});
						$.each($('#'+idDiv+' img[name^="img_"]'), function(index, input){
							$(input).attr("src","");
						});
						$('#editForm'+idForm).val(0);
						$('#'+idDiv+' #div_evaluacionCaptura').collapsible("collapse");
						alert("El formulario se actualizo exitosamente.");
						irOpcion('creditos');
					});
				} else {
					db.transaction(function(tx){
						insert = "INSERT INTO STORAGE(FORM,SUB_FORM,FORM_PROD,FORM_RESPONSE,DATE_CREATED,DATE_UPDATED,ID_DIV,CUSTOMER_REQUESTS) VALUES(?,?,?,?,strftime('%Y-%m-%d %H:%M:%S','now','localtime'),strftime('%Y-%m-%d %H:%M:%S','now','localtime'),?,?)";
						combo = $("#cb_cred_producto").find("option:selected");
						subform = idForm==7?($("#cb_pren_tipoGaranPrendaria").find('option:selected').val()):0;
						tx.executeSql(insert,[idForm,subform,idProd,jsonText,idDiv,clientGlobal.getId()],function(tx, results){
							var id_storage = results.insertId;
							tx.executeSql("INSERT INTO GARANTIAS(ID_SOL,ID_GAR,STATE,ID_USER,DATE_CREATED) VALUES(?,?,1,?,strftime('%Y-%m-%d %H:%M:%S','now','localtime'))",[fid,id_storage,userLoginGlobal.getUserid()]);
							//recorrido de las imagenes
							$.each($('#'+idDiv+' img'), function(index, img){
								tx.executeSql("INSERT INTO FOTOS(ID_IMG,FOTO,ID_STORAGE) VALUES(?,?,?)",[img.id,$('#'+img.id+'_hd').val(),id_storage]);
							});
							mostrarGarantias(fid);
						});
					},app.webdb.onError, function() {
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
						$.each($('#'+idDiv+' textarea'), function(index, input){
							$(input).val("");
						});
						$.each($('#'+idDiv+' img[name^="img_"]'), function(index, input){
							$(input).attr("src","");
						});
						$('#'+idDiv+' #div_evaluacionCaptura').collapsible("collapse");
						$('#editForm'+idForm).val(0);
						alert("El formulario se guardo exitosamente.");
						irOpcion('creditos');
					});
				}
			} 
			else {
				if($('#editForm'+idForm).length && $('#editForm'+idForm).val() > 0){
					db.transaction(function(tx){
						update = "UPDATE STORAGE SET FORM_RESPONSE = ?, DATE_UPDATED = strftime('%Y-%m-%d %H:%M:%S','now','localtime') WHERE ID = ? ";
						tx.executeSql(update,[jsonText, $('#editForm'+idForm).val()],function(tx, results){
							var id_storage = $('#editForm'+idForm).val();
							//recorrido de las imagenes
							$.each($('#'+idDiv+' img'), function(index, img){
								tx.executeSql("INSERT INTO FOTOS(ID_IMG,FOTO,ID_STORAGE) VALUES(?,?,?)",[img.id,$('#'+img.id+'_hd').val(),id_storage]);
							});
							mostrarGarantias(fid);
						});
					},app.webdb.onError, function() {
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
						$.each($('#'+idDiv+' textarea'), function(index, input){
							$(input).val("");
						});
						$.each($('#'+idDiv+' img[name^="img_"]'), function(index, input){
							$(input).attr("src","");
						});
						$('#editForm'+idForm).val(0);
						if(idForm == 2){
							$("#tbl_cred_garan_fiduciarios").html("");
							$("#tbl_cred_garan_fiduciarios").parent().parent().find('h2').find('a').find('span').html("0");
							$("#tbl_cred_garan_hipotecaria").html("");
							$("#tbl_cred_garan_hipotecaria").parent().parent().find('h2').find('a').find('span').html("0");
							$("#tbl_cred_garan_prendaria").html("");
							$("#tbl_cred_garan_prendaria").parent().parent().find('h2').find('a').find('span').html("0");
							//cargamos el listview de las garantias
							$("#warrantReview").listview({create: function( event, ui ) {} });
							$("#warrantReview").listview("refresh");
						}
						//alert("Formulario almacenado con exito.");
						idCliente = clientGlobal.getId();
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
								
								if(cant_creditos > 0) {
									$('#sol_credit_ing').parent().wrap('<a id="prodLstCrd" data-stype="credito" onclick="irOpcion(\'client_product_list\',false, this);return false;"></a>');
								}
								if(cant_ahorro > 0) {
									$('#sol_cue_ahorro').parent().wrap('<a id="prodLstAho" data-stype="ahorro" onclick="irOpcion(\'client_product_list\',false, this);return false;"></a>');
								}
								if(cant_depPlazo > 0) {
									$('#sol_depos').parent().wrap('<a id="prodLstDep" data-stype="deposito" onclick="irOpcion(\'client_product_list\',false, this);return false;"></a>');
								}
								if(cant_remesas > 0) {
									$('#sol_remesas').parent().wrap('<a id="prodLstRem" data-stype="remesa" onclick="irOpcion(\'client_product_list\',false, this);return false;"></a>');
								}
							});
						},function(){},//error
						function(){//exito
							//--------enviar mensaje de exito-------
							if(nomForm.length != 0){
								$('#div_contentMessage').html('El formulario de '+nomForm+' se actualizo exitosamente.');
								$('#div_subMessage').html('Estatus: <strong>completa</strong>');
								$('#div_subMessage').show();
								$('#div_sel_producto').hide();
								$('#btn_sel_producto').hide();
								$('#lnkMsgExitoReturn').removeAttr("onclick");
								$('#lnkMsgExitoReturn').on('click', function(){
									irOpcion('productos');
								});
								irOpcion('msgExitos');
							} else if(idForm == 5 || idForm == 6 || idForm == 7 || idForm == 9 || idForm == 10){
								alert("El formulario se guardo exitosamente.");
								irOpcion('creditos');
							} else {
								$('#div_contentMessage').html('El formulario se actualizo exitosamente.');
								$('#div_subMessage').html('Estatus: <strong>completa</strong>');
								$('#div_subMessage').show();
								$('#div_sel_producto').hide();
								$('#btn_sel_producto').hide();
								irOpcion('msgExitos');
								//irOpcion('productos');
							}
						});
					});
				} else {
			db.transaction(function(tx){
				insert = "INSERT INTO STORAGE(FORM,FORM_PROD,FORM_RESPONSE,DATE_CREATED,DATE_UPDATED, ID_DIV, CUSTOMER_REQUESTS) VALUES(?,?,?,strftime('%Y-%m-%d %H:%M:%S','now','localtime'),strftime('%Y-%m-%d %H:%M:%S','now','localtime'),?,?)";
				//OBTENEMOS producto de acuerdo al formulario
			 	var idProd = 0;
			 	var combo;
				var params =[];
			 	if(idForm == 2 || idForm == 5 || idForm == 6 || idForm == 7 || idForm == 9 || idForm == 10){
					 params = [idForm,idProd,jsonText,idDiv,clientGlobal.getId()];
			 		combo = $("#cb_cred_producto").find("option:selected");
			 		idProd = combo.val();
			 	} else if(idForm==3){
					 params = [idForm,idProd,jsonText,idDiv,clientGlobal.getId()];
			 		combo = $("#cb_aho_producto").find("option:selected");
			 		idProd = combo.val();
			 	} else if(idForm==4){
					 params = [idForm,idProd,jsonText,idDiv,clientGlobal.getId()];
			 		combo = $("#cb_desPlazos_producto").find("option:selected");
			 		idProd = combo.val();
			 	} else if(idForm==8){
					 params = [idForm,idProd,jsonText,idDiv,clientGlobal.getId()];
			 		idProd = 13;
			 	} else if(idForm==666){
					params = [idForm,idProd,jsonText,idDiv,0];
				}
				tx.executeSql(insert,params,function(tx, results){
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
				$.each($('#'+idDiv+' textarea'), function(index, input){
					$(input).val("");
				});
				$.each($('#'+idDiv+' img[name^="img_"]'), function(index, input){
					$(input).attr("src","");
				});
				if(idForm == 2){
					$("#tbl_cred_garan_fiduciarios").html("");
					$("#tbl_cred_garan_fiduciarios").parent().parent().find('h2').find('a').find('span').html("0");
					$("#tbl_cred_garan_hipotecaria").html("");
					$("#tbl_cred_garan_hipotecaria").parent().parent().find('h2').find('a').find('span').html("0");
					$("#tbl_cred_garan_prendaria").html("");
					$("#tbl_cred_garan_prendaria").parent().parent().find('h2').find('a').find('span').html("0");
					//cargamos el listview de las garantias
					$("#warrantReview").listview({create: function( event, ui ) {} });
					$("#warrantReview").listview("refresh");
				}
				//alert("Formulario almacenado con exito.");
				idCliente = clientGlobal.getId();
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
						
						if(cant_creditos > 0) {
							$('#sol_credit_ing').parent().wrap('<a id="prodLstCrd" data-stype="credito" onclick="irOpcion(\'client_product_list\',false, this);return false;"></a>');
						}
						if(cant_ahorro > 0) {
							$('#sol_cue_ahorro').parent().wrap('<a id="prodLstAho" data-stype="ahorro" onclick="irOpcion(\'client_product_list\',false, this);return false;"></a>');
						}
						if(cant_depPlazo > 0) {
							$('#sol_depos').parent().wrap('<a id="prodLstDep" data-stype="deposito" onclick="irOpcion(\'client_product_list\',false, this);return false;"></a>');
						}
						if(cant_remesas > 0) {
							$('#sol_remesas').parent().wrap('<a id="prodLstRem" data-stype="remesa" onclick="irOpcion(\'client_product_list\',false, this);return false;"></a>');
						}
					});
				},function(){},//error
				function(){//exito
					//--------enviar mensaje de exito-------
					if(nomForm.length != 0){
						$('#div_contentMessage').html('El formulario de '+nomForm+' se guardo exitosamente.');
						$('#div_subMessage').html('Estatus: <strong>completa</strong>');
						$('#div_subMessage').show();
						$('#div_sel_producto').hide();
						$('#btn_sel_producto').hide();
						$('#lnkMsgExitoReturn').on('click', function(){
							irOpcion('productos');
						});
						irOpcion('msgExitos');
					} else if(idForm == 5 || idForm == 6 || idForm == 7 || idForm == 9 || idForm == 10){
						alert("El formulario se guardo exitosamente.");
						irOpcion('creditos');
					} else {
						$('#div_contentMessage').html('El formulario se guardo exitosamente.');
						$('#div_subMessage').html('Estatus: <strong>completa</strong>');
						$('#div_subMessage').show();
						$('#div_sel_producto').hide();
						$('#btn_sel_producto').hide();
						$('#lnkMsgExitoReturn').on('click', function(){
							irOpcion('productos');
						});
						irOpcion('msgExitos');
						//irOpcion('productos');
					}
				});
			});
			}
			}
		}//fin else
	}
	else{
		alert('Deben llenarse los campos marcados en ROJO.');
	}
}

function guardarClienteServer(obj) {
	app.hdh.verificarLogin(1);
	var db = app.webdb.db;
	db.transaction(function(tx){
		tx.executeSql("SELECT ID_CAP_CUSTOMER FROM CAP_CUSTOMER WHERE TYPE_IDENTITY = ? AND IDENTITY = ?",[obj.TYPE_IDENTITY, obj.IDENTITY],
		function(tx,results){
			var len = results.rows.length;
			if(len != 0)
			{
				idcli = results.rows.item(0);
				//actualizo
				var updateCap = "UPDATE CAP_CUSTOMER SET firstname=?,midname=?,lastname1=?,lastname2=?,gender=?,birthday=?,nationality=?,ocupation=?,education=?, patrimony=?, agencia=? WHERE ID_CAP_CUSTOMER = ?";
				tx.executeSql(updateCap,[obj.FIRSTNAME,obj.MIDNAME,obj.LASTNAME1,obj.LASTNAME2,obj.GENDER,obj.BIRTHDAY,obj.NATIONALITY,obj.OCUPATION,obj.EDUCATION,obj.PATRIMONY, obj.AGENCIA, idcli.ID_CAP_CUSTOMER]);
			} else {
				//inserto
				var insCliente = "INSERT INTO cap_customer(id_cap_customer, firstname,midname,lastname1,lastname2,type_identity,identity,gender,birthday,status,nationality,ocupation,education,patrimony, active,date_created, agencia) ";
					insCliente += "VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,strftime('%Y-%m-%d','now','localtime'),?)";
				tx.executeSql(insCliente,[obj.ID, obj.FIRSTNAME,obj.MIDNAME,obj.LASTNAME1,obj.LASTNAME2,obj.TYPE_IDENTITY,obj.IDENTITY,obj.GENDER,obj.BIRTHDAY,obj.STATUS,obj.NATIONALITY,obj.OCUPATION,obj.EDUCATION,obj.PATRIMONY,1, obj.AGENCIA]);
			}
		});
	});
}

function guardarFormularioServer(obj) {
	app.hdh.verificarLogin(1);
	var db = app.webdb.db;
	db.transaction(function(tx){
		//tx.executeSql("SELECT ID FROM STORAGE WHERE FORM = ? AND SUB_FORM=? AND CUSTOMER_REQUESTS = ?",[obj.FORM, obj.SUB_FORM, obj.CUSTOMER_REQUEST],
		tx.executeSql("SELECT ID FROM STORAGE WHERE FORM = ? AND CUSTOMER_REQUESTS = ? AND ID_FORM_SERVER = ? ",[obj.FORM, obj.CUSTOMER_REQUEST, obj.ID_FORM_SERVER],
		function(tx,results){
			var len = results.rows.length;
			if(len != 0)
			{
				idcli = results.rows.item(0);
				//actualizo
				var updateCap = "UPDATE STORAGE SET FORM_RESPONSE=?, FORM_PROD=?, ID_FORM_SERVER=?, ID_FORM_SERVER_R=? WHERE ID = ?";
				tx.executeSql(updateCap,[obj.FORM_RESPONSE,obj.FORM_PROD, obj.ID_FORM_SERVER, obj.ID_FORM_SERVER_R, idcli.ID]);
			} else {
				//inserto
				insert = "INSERT INTO STORAGE(FORM,SUB_FORM,FORM_PROD,FORM_RESPONSE,DATE_CREATED,ID_DIV, CUSTOMER_REQUESTS, ID_FORM_SERVER, ID_FORM_SERVER_R) VALUES(?,?,?,?,strftime('%Y-%m-%d','now','localtime'),?,?,?,?)";
				tx.executeSql(insert,[obj.FORM,obj.SUB_FORM,obj.FORM_PROD,obj.FORM_RESPONSE,obj.ID_DIV,obj.CUSTOMER_REQUEST, obj.ID_FORM_SERVER, obj.ID_FORM_SERVER_R]);
			}
		});
	});
}

//Funciones para la Evaluacion  Financiera
function cargarInformacion(){
	$('#txt_res_costoVenta').NumBox("setRaw", eval($('#txt_res_costoVenta').NumBox('getRaw').length==0?0:parseFloat($('#txt_res_costoVenta').NumBox('getRaw'))));
	
	//Cargamos la información del Patrimonio del Cliente
	$('#txt_bal_patrimonio').NumBox('setRaw', clientGlobal.getPatrimonio());
	
	//Cargamos la información del credito que solicita
	$('#txt_cuo_montoSolicitado').NumBox('setRaw', eval($('#txt_cred_montoSolic').NumBox('getRaw').length==0?0:parseFloat($('#txt_cred_montoSolic').NumBox('getRaw'))));
	$('#txt_cuo_plazo').val($('#txt_cred_plazo').val());
	$('#txt_cuo_frecuencia').val($('#txt_cred_nCuotas').val());
	$('#txt_cuo_interes').val($('#txt_cred_tasaInteres').val());
	
	
}

function calculosBalance() {
	//Calculamos Activos
	var val1 = eval($('#txt_bal_cajasyBancos').NumBox('getRaw').length==0?0:$('#txt_bal_cajasyBancos').NumBox('getRaw'));
	var val2 = eval($('#txt_bal_cuentasxCobrar').NumBox('getRaw').length==0?0:$('#txt_bal_cuentasxCobrar').NumBox('getRaw'));
	var val3 = eval($('#txt_bal_inventario').NumBox('getRaw').length==0?0:$('#txt_bal_inventario').NumBox('getRaw'));
	var val4 = eval($('#txt_bal_invagro').NumBox('getRaw').length==0?0:$('#txt_bal_invagro').NumBox('getRaw'));
	
	var circulante = val1 + val2 + val3 + val4;
	
	$('#txt_bal_activoCirculante').NumBox('setRaw', circulante);

	var patrimonio = eval($('#txt_bal_patrimonio').NumBox('getRaw').length==0?0:$('#txt_bal_patrimonio').NumBox('getRaw'));
	var activos = circulante + patrimonio
	
	$('#txt_bal_activos').NumBox('setRaw', activos);
	
	//Calculamos Pasivos
	var val1 = eval($('#txt_bal_cuentasxPagar').NumBox('getRaw').length==0?0:$('#txt_bal_cuentasxPagar').NumBox('getRaw'));
	var val2 = eval($('#txt_bal_proveedores').NumBox('getRaw').length==0?0:$('#txt_bal_proveedores').NumBox('getRaw'));
	var pasivos = val1 + val2;
	$('#txt_bal_pasivos').NumBox('setRaw', pasivos);
	
	
	//Calculamos Capital
	var capital = activos-pasivos;
	$('#txt_bal_capital').NumBox('setRaw', capital);
	
	//Calculamos el Total
	$('#txt_bal_total').NumBox('setRaw', (pasivos + capital));
}

function calculosEstadosFin() {
	//la venta al contado
	var c1 = eval($('#txt_res_ventaContadoBueno').NumBox('getRaw').length==0?0:$('#txt_res_ventaContadoBueno').NumBox('getRaw'));
	var c2 = eval($('#txt_res_ventaContadoRegular').NumBox('getRaw').length==0?0:$('#txt_res_ventaContadoRegular').NumBox('getRaw'));
	var c3 = eval($('#txt_res_ventaContadoMalo').NumBox('getRaw').length==0?0:$('#txt_res_ventaContadoMalo').NumBox('getRaw'));
	var contado = (c1 + c2 + c3)/3;
	//la venta al credito
	var v1 = eval($('#txt_res_ventaCreditoBueno').NumBox('getRaw').length==0?0:$('#txt_res_ventaCreditoBueno').NumBox('getRaw'));
	var v2 = eval($('#txt_res_ventaCreditoRegular').NumBox('getRaw').length==0?0:$('#txt_res_ventaCreditoRegular').NumBox('getRaw'));
	var v3 = eval($('#txt_res_ventaCreditoMalo').NumBox('getRaw').length==0?0:$('#txt_res_ventaCreditoMalo').NumBox('getRaw'));
	var credito = (v1 + v2 + v3)/3;
	
	$('#txt_res_sumaVentaContado').NumBox('setRaw', contado);
	$('#txt_res_sumaVentaCredito').NumBox('setRaw', credito);
	
	var sumatotal = contado + credito;
	$('#txt_res_sumaVenta').NumBox('setRaw', sumatotal);
	
	//calculamos costo de venta
	var costoventa = sumatotal * (parseFloat($("#cb_res_costoVentas option:selected").data("value"))/100);
	$('#txt_res_sumaCostoVenta').NumBox('setRaw', costoventa);
	
	var utilidad = sumatotal-costoventa;
	$('#txt_res_utilidad').NumBox('setRaw', utilidad);
	
	//Sacamos la suma de los gastos fijos
	var g1 = eval($('#txt_res_salarios').NumBox('getRaw').length==0?0:$('#txt_res_salarios').NumBox('getRaw'));
	var g2 = eval($('#txt_res_alquiler').NumBox('getRaw').length==0?0:$('#txt_res_alquiler').NumBox('getRaw'));
	var g3 = eval($('#txt_res_serviciosPublicos').NumBox('getRaw').length==0?0:$('#txt_res_serviciosPublicos').NumBox('getRaw'));
	var g4 = eval($('#txt_res_alimentacion').NumBox('getRaw').length==0?0:$('#txt_res_alimentacion').NumBox('getRaw'));
	var g5 = eval($('#txt_res_educasalud').NumBox('getRaw').length==0?0:$('#txt_res_educasalud').NumBox('getRaw'));
	var g6 = eval($('#txt_res_transotros').NumBox('getRaw').length==0?0:$('#txt_res_transotros').NumBox('getRaw'));
	var g7 = eval($('#txt_res_otros').NumBox('getRaw').length==0?0:$('#txt_res_otros').NumBox('getRaw'));
	var gastosfijos = g1 + g2 + g3 + g4 + g5 + g6 + g7;
	
	$('#txt_res_sumaGastos').NumBox('setRaw', gastosfijos);
	
	//Calculamos la utilidad neta
	var utilidadNeta = utilidad-gastosfijos;
	$('#txt_res_utilidadNeta').NumBox('setRaw', utilidadNeta);
	
	//Calculamos la Disponibilidad Real
	var obligneg = eval($('#txt_res_pagoints').NumBox('getRaw').length==0?0:$('#txt_res_pagoints').NumBox('getRaw'));
	var disponibilidad = utilidadNeta - obligneg;
	
	$('#txt_res_disponibilidad').NumBox('setRaw', disponibilidad);
	
	//Calculamos la Disponibilidad del Cliente
	var d1 = eval($('#txt_res_otrosIngresos').NumBox('getRaw').length==0?0:$('#txt_res_otrosIngresos').NumBox('getRaw'));
	var d2 = eval($('#txt_res_otrosIngresosFam').NumBox('getRaw').length==0?0:$('#txt_res_otrosIngresosFam').NumBox('getRaw'));
	var d3 = eval($('#txt_res_gastoFamiliar').NumBox('getRaw').length==0?0:$('#txt_res_gastoFamiliar').NumBox('getRaw'));
	
	var dispcliente = disponibilidad + d1 + d2 - d3;
	
	$('#txt_res_disponibilidadCliente').NumBox('setRaw', dispcliente);
	
	//para los campos Anual
	
	$("#txt_res_sumaVenta_anual").NumBox('setRaw', (parseFloat(eval($("#txt_res_sumaVenta").NumBox('getRaw').length==0?0:$("#txt_res_sumaVenta").NumBox('getRaw')))*12));
	$("#txt_res_sumaVentaContado_anual").NumBox('setRaw', (parseFloat(eval($("#txt_res_sumaVentaContado").NumBox('getRaw').length==0?0:$("#txt_res_sumaVentaContado").NumBox('getRaw')))*12));
	$("#txt_res_sumaVentaCredito_anual").NumBox('setRaw', (parseFloat(eval($("#txt_res_sumaVentaCredito").NumBox('getRaw').length==0?0:$("#txt_res_sumaVentaCredito").NumBox('getRaw')))*12));
	$("#txt_res_sumaCostoVenta_anual").NumBox('setRaw', (parseFloat(eval($("#txt_res_sumaCostoVenta").NumBox('getRaw').length==0?0:$("#txt_res_sumaCostoVenta").NumBox('getRaw')))*12));
	$("#txt_res_utilidad_anual").NumBox('setRaw', (parseFloat(eval($("#txt_res_utilidad").NumBox('getRaw').length==0?0:$("#txt_res_utilidad").NumBox('getRaw')))*12));
	$("#txt_res_sumaGastos_anual").NumBox('setRaw', (parseFloat(eval($("#txt_res_sumaGastos").NumBox('getRaw').length==0?0:$("#txt_res_sumaGastos").NumBox('getRaw')))*12));
	$("#txt_res_salarios_anual").NumBox('setRaw', (parseFloat(eval($("#txt_res_salarios").NumBox('getRaw').length==0?0:$("#txt_res_salarios").NumBox('getRaw')))*12));
	$("#txt_res_alquiler_anual").NumBox('setRaw', (parseFloat(eval($("#txt_res_alquiler").NumBox('getRaw').length==0?0:$("#txt_res_alquiler").NumBox('getRaw')))*12));
	$("#txt_res_serviciosPublicos_anual").NumBox('setRaw', (parseFloat(eval($("#txt_res_serviciosPublicos").NumBox('getRaw').length==0?0:$("#txt_res_serviciosPublicos").NumBox('getRaw')))*12));
	$("#txt_res_alimentacion_anual").NumBox('setRaw', (parseFloat(eval($("#txt_res_alimentacion").NumBox('getRaw').length==0?0:$("#txt_res_alimentacion").NumBox('getRaw')))*12));
	$("#txt_res_educasalud_anual").NumBox('setRaw', (parseFloat(eval($("#txt_res_educasalud").NumBox('getRaw').length==0?0:$("#txt_res_educasalud").NumBox('getRaw')))*12));
	$("#txt_res_transotros_anual").NumBox('setRaw', (parseFloat(eval($("#txt_res_transotros").NumBox('getRaw').length==0?0:$("#txt_res_transotros").NumBox('getRaw')))*12));
	$("#txt_res_otros_anual").NumBox('setRaw', (parseFloat(eval($("#txt_res_otros").NumBox('getRaw').length==0?0:$("#txt_res_otros").NumBox('getRaw')))*12));
	$("#txt_res_utilidadNeta_anual").NumBox('setRaw', (parseFloat(eval($("#txt_res_utilidadNeta").NumBox('getRaw').length==0?0:$("#txt_res_utilidadNeta").NumBox('getRaw')))*12));
	$("#txt_res_pagoints_anual").NumBox('setRaw', (parseFloat(eval($("#txt_res_pagoints").NumBox('getRaw').length==0?0:$("#txt_res_pagoints").NumBox('getRaw')))*12));
	$("#txt_res_disponibilidad_anual").NumBox('setRaw', (parseFloat(eval($("#txt_res_disponibilidad").NumBox('getRaw').length==0?0:$("#txt_res_disponibilidad").NumBox('getRaw')))*12));
	$("#txt_res_otrosIngresos_anual").NumBox('setRaw', (parseFloat(eval($("#txt_res_otrosIngresos").NumBox('getRaw').length==0?0:$("#txt_res_otrosIngresos").NumBox('getRaw')))*12));
	$("#txt_res_otrosIngresosFam_anual").NumBox('setRaw', (parseFloat(eval($("#txt_res_otrosIngresosFam").NumBox('getRaw').length==0?0:$("#txt_res_otrosIngresosFam").NumBox('getRaw')))*12));
	$("#txt_res_gastoFamiliar_anual").NumBox('setRaw', (parseFloat(eval($("#txt_res_gastoFamiliar").NumBox('getRaw').length==0?0:$("#txt_res_gastoFamiliar").NumBox('getRaw')))*12));
	$("#txt_res_disponibilidadCliente_anual").NumBox('setRaw', (parseFloat(eval($("#txt_res_disponibilidadCliente").NumBox('getRaw').length==0?0:$("#txt_res_disponibilidadCliente").NumBox('getRaw')))*12));
}

function calculosAnalisisCuota() {
		var cal1 = eval($('#txt_cuo_montoRecomendado').NumBox('getRaw').length==0?0:$('#txt_cuo_montoRecomendado').NumBox('getRaw'));
		var cal2 = eval($('#txt_cuo_plazo').val().length==0?0:$('#txt_cuo_plazo').val());
		var cal3 = eval($('#txt_cuo_frecuencia').val().length==0?0:$('#txt_cuo_frecuencia').val());
		var cal4 = eval($('#txt_cuo_interes').NumBox('getRaw').length==0?0:$('#txt_cuo_interes').NumBox('getRaw'))/100;
		
		var cuota = (cal1*(cal4)/12*cal2/cal3)+cal1/cal3
		
		$('#txt_cuo_cuotaRecomendada').NumBox('setRaw', eval(isNaN(cuota)?0:cuota));
}

function calculoIndicadores(){
	var d1 = $('#txt_res_utilidad').NumBox('getRaw').length==0?0:$('#txt_res_utilidad').NumBox('getRaw');
	var d2 = $('#txt_res_sumaVenta').NumBox('getRaw').length==0?0:$('#txt_res_sumaVenta').NumBox('getRaw');
	var d3 = $('#txt_bal_activoCirculante').NumBox('getRaw').length==0?0:$('#txt_bal_activoCirculante').NumBox('getRaw');
	var d4 = $('#txt_bal_pasivos').NumBox('getRaw').length==0?0:$('#txt_bal_pasivos').NumBox('getRaw');
	var d5 = $('#txt_bal_inventario').NumBox('getRaw').length==0?0:$('#txt_bal_inventario').NumBox('getRaw');
	var d6 = $('#txt_cuo_cuotaRecomendada').NumBox('getRaw').length==0?0:$('#txt_cuo_cuotaRecomendada').NumBox('getRaw');
	var d7 = $('#txt_res_disponibilidad').NumBox('getRaw').length==0?0:$('#txt_res_disponibilidad').NumBox('getRaw');
	var d8 = $('#txt_res_disponibilidadCliente').NumBox('getRaw').length==0?0:$('#txt_res_disponibilidadCliente').NumBox('getRaw');
	
	var rentabilidad = (d1 / d2)*100;
	var liquidez = d3 / d4;
	var razonAcida = (d3-d5)/d4;
	var endeudamiento = (d4 / d3)*100;
	var capitalTrabajo = d3 - d4;
	var pagoNegocio = d7 / d6;
	var pagoCliente = d8 / d6;
	
	$('#txt_efind_ind43').val(!isFinite(rentabilidad)?'-':rentabilidad.toFixed(2) + '%');
	$('#txt_efind_ind44').val(!isFinite(liquidez)?'-':liquidez.toFixed(2));
	$('#txt_efind_ind45').val(!isFinite(razonAcida)?'-':razonAcida.toFixed(2));
	$('#txt_efind_ind46').val(!isFinite(endeudamiento)?'-':endeudamiento.toFixed(2) + '%');
	$('#txt_efind_ind47').NumBox('setRaw', capitalTrabajo);
	$('#txt_efind_ind48').val(!isFinite(pagoNegocio)?'-':pagoNegocio.toFixed(2));
	$('#txt_efind_ind49').val(!isFinite(pagoCliente)?'-':pagoCliente.toFixed(2));
	
	if(!(rentabilidad >= eval($("#txt_efin_ind_val43").val()))) {
		$('#txt_efind_ind43').css({'background-color':'red', 'color':'white'});
	} else {
		$('#txt_efind_ind43').css({'background-color':'white', 'color':'black'});
	}
	
	if(!(liquidez >= eval($("#txt_efin_ind_val44").val()))) {
		$('#txt_efind_ind44').css({'background-color':'red', 'color':'white'});
	} else {
		$('#txt_efind_ind44').css({'background-color':'white', 'color':'black'});
	}
	
	if(!(razonAcida >= eval($("#txt_efin_ind_val45").val()))) {
		$('#txt_efind_ind45').css({'background-color':'red', 'color':'white'});
	} else {
		$('#txt_efind_ind45').css({'background-color':'white', 'color':'black'});
	}
	
	if(!(endeudamiento <= eval($("#txt_efin_ind_val46").val()))) {
		$('#txt_efind_ind46').css({'background-color':'red', 'color':'white'});
	} else {
		$('#txt_efind_ind46').css({'background-color':'white', 'color':'black'});
	}
	
	if(!(pagoNegocio >= eval($("#txt_efin_ind_val48").val()))) {
		$('#txt_efind_ind48').css({'background-color':'red', 'color':'white'});
	} else {
		$('#txt_efind_ind48').css({'background-color':'white', 'color':'black'});
	}
	
	if(!(pagoCliente >= eval($("#txt_efin_ind_val49").val()))) {
		$('#txt_efind_ind49').css({'background-color':'red', 'color':'white'});
	} else {
		$('#txt_efind_ind49').css({'background-color':'white', 'color':'black'});
	}
	
}

function calculoCrecimiento() {
	$('#t_activos').autoNumeric('set', $('#txt_bal_activos').NumBox('getRaw'));
	$('#t_pasivos').autoNumeric('set', $('#txt_bal_pasivos').NumBox('getRaw'));
	$('#t_capital').autoNumeric('set', $('#txt_bal_capital').NumBox('getRaw'));
	$('#t_inventario').autoNumeric('set', ($('#txt_bal_inventario').NumBox('getRaw') + $("#txt_bal_invagro").NumBox('getRaw')));
	$('#t_utilidad').autoNumeric('set', $('#txt_res_utilidadNeta').NumBox('getRaw'));
	
	$('#v_activos').autoNumeric('set', eval($('#t_activos').autoNumeric('get') - parseFloat($("#txt_crec_activos_pasado").NumBox('getRaw'))));
	$('#v_pasivos').autoNumeric('set', eval($('#t_pasivos').autoNumeric('get') - parseFloat($("#txt_crec_pasivos_pasado").NumBox('getRaw'))));
	$('#v_capital').autoNumeric('set', eval($('#t_capital').autoNumeric('get') - parseFloat($("#txt_crec_capital_pasado").NumBox('getRaw'))));
	$('#v_inventario').autoNumeric('set', eval($('#t_inventario').autoNumeric('get') - parseFloat($("#txt_crec_inventarios_pasado").NumBox('getRaw'))));
	$('#v_utilidad').autoNumeric('set', eval($('#t_utilidad').autoNumeric('get') - parseFloat($("#txt_crec_utilidad_pasado").NumBox('getRaw'))));
	
	var r1 = eval(isNaN(($('#v_activos').autoNumeric('get') / parseFloat($("#txt_crec_activos_pasado").NumBox('getRaw'))))?0:(parseFloat($('#v_activos').html()) / parseFloat($("#txt_crec_activos_pasado").NumBox('getRaw'))));
	var r2 = eval(isNaN(($('#v_pasivos').autoNumeric('get') / parseFloat($("#txt_crec_pasivos_pasado").NumBox('getRaw'))))?0:(parseFloat($('#v_pasivos').html()) / parseFloat($("#txt_crec_pasivos_pasado").NumBox('getRaw'))));
	var r3 = eval(isNaN(($('#v_capital').autoNumeric('get') / parseFloat($("#txt_crec_capital_pasado").NumBox('getRaw'))))?0:(parseFloat($('#v_capital').html()) / parseFloat($("#txt_crec_capital_pasado").NumBox('getRaw'))));
	var r4 = eval(isNaN(($('#v_inventario').autoNumeric('get') / parseFloat($("#txt_crec_inventarios_pasado").NumBox('getRaw'))))?0:(parseFloat($('#v_inventario').html()) / parseFloat($("#txt_crec_inventarios_pasado").NumBox('getRaw'))));
	var r5 = eval(isNaN(($('#v_utilidad').autoNumeric('get') / parseFloat($("#txt_crec_utilidad_pasado").NumBox('getRaw'))))?0:(parseFloat($('#v_utilidad').html()) / parseFloat($("#txt_crec_utilidad_pasado").NumBox('getRaw'))));
	
	$('#p_activos').html((r1*100).toFixed(2) + '%');
	$('#p_pasivos').html((r2*100).toFixed(2) + '%');
	$('#p_capital').html((r3*100).toFixed(2) + '%');
	$('#p_inventario').html((r4*100).toFixed(2) + '%');
	$('#p_utilidad').html((r5*100).toFixed(2) + '%');
}
// Fin de Funciones

//Funciones para hoja de Resolucion
function cargarAntecendentes() {
	$.ajax({
		type: "POST",
		dataType: 'jsonp',
		jsonp: "jsoncallback",
		url: apiUrl+ "/antecedentes",
		data: {identidad:clientGlobal.getNoIdentidad()},
		cache: false,
		dataType: "text",
		timeout: 60000, //3 second timeout
		beforeSend: function(objeto){$.mobile.loading( "show", {
		  textVisible: true,
		  html: "<img style='padding-left:35px' src='css/themes/images/ajax-loader.gif'/>"
	});console.log("cargando antecedentes.");$("#tbl_reso_antecendetes").html("<td><td style='text-align:center;' colspan='7'>Cargando Informacion...</td></tr>");},
		success: function(datos){
			$("#tbl_reso_antecendetes").html("");
			$.mobile.loading("hide"); 
			$("#tbl_reso_antecendetes").html(datos);
		},
		error: function(objeto, mensaje, otroobj){$.mobile.loading("hide");alert('Se agoto el tiempo de espera, imposible conectar con el servidor. (posible falla en la conexion de internet o desconexion del servidor).'); console.log("Trono antecedentes.") }
	});
}

function cargarDatosCredito() {
	var agencia = userLoginGlobal.getCompanyId() + ' - ' + userLoginGlobal.getCompanyName().toUpperCase();
	$("#lbl_agencia").html(agencia);
	$("#lbl_tprestamo").html($("#cb_cred_tiopPrestamo option:selected").text().toUpperCase());
	$("#lbl_asesor").html(userLoginGlobal.getNombreCompleto().toUpperCase());
	
	$("#lbl_noperacion").html($("#txt_cred_nOperacion").val());
	$("#lbl_tfinan").html($("#cb_cred_tipoFinanciamiento option:selected").text().toUpperCase());
	$("#lbl_producto").html($("#cb_cred_producto option:selected").text().toUpperCase());
	
	$("#lbl_credmonto").html($("#txt_cred_montoSolic").val());
	$("#lbl_credplazo").html($("#txt_cred_plazo").val() + " MESES");
	$("#lbl_credfrpago").html($("#cb_cred_frecuenciaPago option:selected").text().toUpperCase());
	
	$("#lbl_credinteres").html($("#txt_cred_tasaInteres").val()+" %");
	$("#lbl_credtpago").html($("#cb_cred_formaPago option:selected").text().toUpperCase());
	$("#lbl_creddest").html($("#cb_cred_destino option:selected").text().toUpperCase());
	
	$("#lbl_credrubro").html($("#cb_cred_rubro option:selected").text().toUpperCase());
	$("#lbl_credactividad").html($("#cb_cred_actEspecifica option:selected").text().toUpperCase());
}

function cargarGarantias() {
	var db = app.webdb.db;
	var html = "";
	var idCliente = clientGlobal.getId();
	var idSolicitud = $("#credId_resolucion").val();
	db.transaction(function(tx){
		tx.executeSql("SELECT s.ID, FORM, FORM_RESPONSE FROM STORAGE s INNER JOIN GARANTIAS g ON g.ID_GAR=S.ID WHERE g.ID_SOL = ?",[idSolicitud],function(tx,results){
			var len = results.rows.length;
			if(len != 0) {
				var idformulario = results.rows.item(0);
				var gtia1 = '', gtia2 = "", gtia3 = "";
				var cor = 34;
				for(var i=0;i<len;i++){
					var row = results.rows.item(i);
					var response = JSON.parse(row['FORM_RESPONSE'].replace(new RegExp('\r?\n','g'), '\\r\\n'));
					var prendas = ['','','','Vehicular','Maquinaria/Bienes','','Ahorros'];
					var inmuebles = ['','Solar','Solar y Casa','Terreno','Terreno y Casa'];
					if(response.idFormulario == 5) {
						cor++;
						gtia1 += '<tr>';
						gtia1 += '	<td width="15%"><strong>'+cor+'. Aval '+(cor-34)+'</strong></td>';
						gtia1 += '	<td width="70%">'+response.txt_primerNombre.toUpperCase();
						gtia1 += response.txt_segundoNombre==null?' ':response.txt_segundoNombre.toUpperCase()+' ';
						gtia1 += response.txt_primerApellido.toUpperCase();
						gtia1 += response.txt_segundoApellido==null?'</td>':response.txt_segundoApellido.toUpperCase() +'</td>';
						gtia1 += '	<td>L.</td>';
						gtia1 += '	<td style="text-align:right"><span style="text-align:right;">'+response.txt_total+'</span></td>';
						gtia1 += '</tr>';
					} else if(response.idFormulario  == 6) {
						gtia2 += '<tr>';
						gtia2 += '	<td width="84%">&nbsp;&nbsp;&nbsp;&nbsp;'+inmuebles[response.cb_hipo_tipoInmueble]+' <strong>a nombre de</strong> '+response.txt_hipo_propietarioInmueble.toUpperCase()+' '+response.txt_hipo_primerApellido.toUpperCase()+' '+response.txt_hipo_segundoApellido.toUpperCase()+' <strong>por el valor de avaluo</strong></td>';
						gtia2 += '	<td>L.</td>';
						gtia2 += '	<td style="text-align:right"><span style="text-align:right;">'+response.txt_cap_total_avaluo+'</td>';
						gtia2 += '</tr>';
					} else if(response.idFormulario  == 7) {
						nombre = response.cb_pren_tipoGaranPrendaria==6?response.txt_pren_AhoNombrePropietario.toUpperCase():response.txt_pren_nombre.toUpperCase();
						valor = 0;
						if(response.cb_pren_tipoGaranPrendaria == 3){
							valor = response.txt_pren_vehValorAvaluo;
						} else if(response.cb_pren_tipoGaranPrendaria == 4) {
							valor = response.txt_pren_maqValorGranTotal;
						} else {
							valor = response.txt_pren_AhoValorGarantia;
						}
						gtia3 += '<tr>';
						gtia3 += '	<td width="84%">&nbsp;&nbsp;&nbsp;&nbsp;<strong>Prenda</strong> '+ prendas[response.cb_pren_tipoGaranPrendaria] +' <strong>a nombre de</strong> '+ nombre.toUpperCase() +' <strong>por el valor de</strong></td>';
						gtia3 += '	<td>L.</td>';
						gtia3 += '	<td style="text-align:right"><span style="text-align:right;">'+valor+'</td>';
						gtia3 += '</tr>';
					}
				}//fin for
				$("#tbl_res_gtia_fidu").html(gtia1);
				$("#tbl_res_gtia_hipo").html(gtia2);
				$("#tbl_res_gtia_pren").html(gtia3);
			}
		});
	}, app.webdb.onError);
}
// Fin Funciones

// Para la parte de paginacion
$( "#txt_findCliente" ).on( "keyup", function( e) {
	var input = $(this);	
	if(input.val() == ""){
		$('#ul_detalleCliente_list').html("<tr><td colspan='7' style='text-align:center'>Actualizando listado...</td></tr>");
		cargarListaCliente(0,0,50,1);
	} else {
		if(input.val().length > 2) {
			$('#ul_detalleCliente_list').html("<tr><td colspan='7' style='text-align:center'>Actualizando listado...</td></tr>");
			var db = app.webdb.db;
			var query = "SELECT ID_CAP_CUSTOMER, FIRSTNAME, MIDNAME, LASTNAME1, LASTNAME2, NATIONALITY, IDENTITY FROM CAP_CUSTOMER WHERE (FIRSTNAME||\" \"||MIDNAME||\" \"||LASTNAME1||\" \"||LASTNAME2) LIKE '%"+input.val()+"%' ORDER BY LASTNAME1, LASTNAME2";
			var html = "";
			db.transaction(function(tx){
				tx.executeSql(query,[],function(tx,results){
					var len = results.rows.length;
					$('#ul_detalleCliente_list').html("");
					for(var i=0;i<len;i++){
						var row = results.rows.item(i);
						curr = i + 1;
						html = '<tr><td><img style="width:16px;height:16px;" src="images/ico-perfil.png" /></td><td>'+curr+'</td>';
						html += '<td style="width: 60px">'+row['ID_CAP_CUSTOMER']+'</td><td>'+row['FIRSTNAME'].toUpperCase()+' '+row['MIDNAME'].toUpperCase()+'</td><td>'+row['LASTNAME1'].toUpperCase()+' '+row['LASTNAME2'].toUpperCase()+'</td><td>'+row['IDENTITY']+'</td>';
						html += '<td width="16%"><img src="images/bot-seleccionar.png" onclick="llenarClienteSesion('+row['ID_CAP_CUSTOMER']+');return false;"/></td></tr>';
						$('#ul_detalleCliente_list').append(html);
					}//fin for
					$("#fctnc").hide();
					$("#btnpagcli").closest('.ui-btn').hide();
				});
			}, app.webdb.onError);
		}
	}
});
$( "#txt_findCliente" ).on( "change", function( e) {
	var input = $(this);
	$('#ul_detalleCliente_list').html("<tr><td colspan='7' style='text-align:center'>Actualizando listado...</td></tr>");
	if(input.val() == ""){
		cargarListaCliente(0,0,50,1);
	} else {
		input.keyup();
	}
});

$( "#txt_fidu_findCliente" ).on( "keyup", function( e) {
	var input = $(this);	
	if(input.val() == ""){
		$('#ul_detalleElemento_list').html("<tr><td colspan='7' style='text-align:center'>Actualizando listado...</td></tr>");
		cargarListaGarantiasCliente('fiduciario',50,1);
	} else {
		if(input.val().length > 2) {
			$('#ul_detalleElemento_list').html("<tr><td colspan='7' style='text-align:center'>Actualizando listado...</td></tr>");
			var db = app.webdb.db;
			var query = "SELECT s.ID, ID_CAP_CUSTOMER, FIRSTNAME, MIDNAME, LASTNAME1, LASTNAME2, NATIONALITY, IDENTITY, FORM_RESPONSE FROM CAP_CUSTOMER c INNER JOIN STORAGE s ON c.ID_CAP_CUSTOMER=S.CUSTOMER_REQUESTS WHERE S.FORM=1 AND (FIRSTNAME||\" \"||MIDNAME||\" \"||LASTNAME1||\" \"||LASTNAME2) LIKE '%"+input.val()+"%' ORDER BY LASTNAME1, LASTNAME2";
			var html = "";
			db.transaction(function(tx){
				tx.executeSql(query,[],function(tx,results){
					var len = results.rows.length;
					$('#ul_detalleElemento_list').html("");
					for(var i=0;i<len;i++){
						var row = results.rows.item(i);
						var info = $.parseJSON(row['FORM_RESPONSE']);
						curr = i + 1;
						/*html = '<tr><td><img style="width:16px;height:16px;" src="images/ico-perfil.png" /></td><td>'+curr+'</td>';
						html += '<td style="width: 60px">'+row['ID_CAP_CUSTOMER']+'</td><td>'+row['FIRSTNAME'].toUpperCase()+' '+row['MIDNAME'].toUpperCase()+'</td><td>'+row['LASTNAME1'].toUpperCase()+' '+row['LASTNAME2'].toUpperCase()+'</td><td>'+row['IDENTITY']+'</td>';
						html += '<td width="16%"><img src="images/bot-seleccionar.png" onclick="llenarSolicitud('+row['ID']+', 1);return false;"/></td></tr>'; */
						html  = '<tr>';
						html += '<td>'+row['ID']+'</td>';
						html += '<td>'+info.txt_noIdentidad+'</td>';
						html += '<td>'+info.txt_primerNombre.toUpperCase()+' ';
						html += info.txt_segundoNombre==null?'</td>':info.txt_segundoNombre.toUpperCase()+'</td>';
						html += '<td>'+info.txt_primerApellido.toUpperCase()+' ';
						html += info.txt_segundoApellido==null?'</td>':info.txt_segundoApellido.toUpperCase() + '</td>';
						html += '<td>L. '+formatMoney(info.txt_total, 2)+'</td>';
						html += '<td width="16%"><img src="images/bot-seleccionar.png" onclick="llenarSolicitud('+row['ID']+', 1);return false;"/></td></tr>';
						$('#ul_detalleElemento_list').append(html);
					}//fin for
					$("#fctnc").hide();
					$("#btnpagcli").closest('.ui-btn').hide();
				});
			}, app.webdb.onError);
		}
	}
});
$( "#txt_fidu_findCliente" ).on( "change", function( e) {
	var input = $(this);
	$('#ul_detalleElemento_list').html("<tr><td colspan='7' style='text-align:center'>Actualizando listado...</td></tr>");
	if(input.val() == ""){
		cargarListaGarantiasCliente('fiduciario',50,1);
	} else {
		input.keyup();
	}
});
// Fin paginacion

function validarCredito() {
	if($("#editForm2").length){
		var d = $("#editForm2").val();
		if(d == "0"){
			alert("Para crear una garantia primero debe guardar la solicitud.");
			return false;
		}
		return true;
	} else {
		alert("Para crear una garantia primero debe guardar la solicitud.");
		return false;
	}
}