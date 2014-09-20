function Cliente(){
	var id = "";
	var tipoIdentificacion = "";
	var noIdentidad = "";
	var primerNombre = "";
	var segundoNombre = "";
	var primerApellido = "";
	var segundoApellido = "";
	var tiempoResidir = "";
	var fechaNacimiento = "";
	var edad = "";
	var tipoSexo = "";
	var nacionalidad = "";
	var profesion = "";
	var nivelEducativo = "";
	var noHijos = "";
	var estadoCivil = "";	
	var patrimonio = "";
	
	this.getId = function(){
		return id;
	}
	this.getTipoIdentificacion = function(){
		return tipoIdentificacion;
	}
	this.getNoIdentidad = function(){
		return noIdentidad;
	}
	this.getPrimerNombre = function(){
		return primerNombre;
	}	
	this.getSegundoNombre = function(){
		return segundoNombre;
	}	
	this.getPrimerApellido = function(){
		return primerApellido;
	}	
	this.getSegundoApellido = function(){
		return segundoApellido;
	}	
	this.getTiempoResidir = function(){
		return tiempoResidir;
	}	
	this.getFechaNacimiento = function(){
		return fechaNacimiento;
	}	
	this.getEdad = function(){
		return edad;
	}
	this.getTipoSexo = function(){
		return tipoSexo;
	}	
	this.getNacionalidad = function(){
		return nacionalidad;
	}	
	this.getProfesion = function(){
		return profesion;
	}	
	this.getNivelEducativo = function(){
		return nivelEducativo;
	}	
	this.getNoHijos = function(){
		return noHijos;
	}	
	this.getEstadoCivil = function(){
		return estadoCivil;
	}
	this.getPatrimonio = function(){
		return patrimonio;
	}
	
	this.getNombreCompleto = function(){
		return primerNombre + ' ' + segundoNombre + ' ' + primerApellido + ' ' + segundoApellido;
	}
	
	this.cargarDatos = function(pid){
		id = pid;
		tipoIdentificacion = $('#cb_tipoIdentificacion').find('option:selected').val();
		noIdentidad = $('#txt_noIdentidad').val();
		primerNombre = $('#txt_primerNombre').val();
		segundoNombre = $('#txt_segundoNombre').val();
		primerApellido = $('#txt_primerApellido').val();
		segundoApellido = $('#txt_segundoApellido').val();
		tiempoResidir = $('#txt_tiempoResidir').val();
		fechaNacimiento = $('#txt_fechaNacimiento').val();
		edad = $('#txt_edad').val();
		tipoSexo = $('#cb_tipoSexo').find('option:selected').val();
		nacionalidad = $('#txt_nacionalidad').val();
		profesion = $('#cb_profecion').find('option:selected').val();
		nivelEducativo = $('#cb_nivelEducativo').find('option:selected').val();
		noHijos = $('#txt_numeroHijos').val();
		estadoCivil = $('#cb_estadoCivil').find('option:selected').val();	
		patrimonio = $('#hd_patrimonio').val();
	}
}//fin clase

function UserLogin() {
	var nombre;
	var pass;
	var userid;
	var rolename;
	var companyName;
	var companyId;
	var companyPlace;
	var nombreCompleto;
	
	this.setNombre = function(nombre){
		this.nombre = nombre;
	}
	
	this.getNombre = function(){
		return this.nombre;
	}
	
	this.setNombreCompleto = function(nombreCompleto) {
		this.nombreCompleto = nombreCompleto
	}
	
	this.getNombreCompleto = function() {
		return this.nombreCompleto;
	}
	
	this.setPass = function(pass){
		this.pass = pass;
	}
	
	this.getPass = function(){
		return this.pass;
	}
	
	this.setUserid = function(userid){
		this.userid = userid;
	}
	
	this.getUserid = function(){
		return this.userid;
	}
	
	this.setRolename = function(rolename){
		this.rolename = rolename;
	}
	
	this.getRolename = function(){
		return this.rolename;
	}
	
	this.setCompanyName = function(companyName){
		this.companyName = companyName;
	}
	
	this.getCompanyName = function() {
		return this.companyName;
	}
	
	this.setCompanyId = function(companyId){
		this.companyId = companyId;
	}
	
	this.getCompanyId = function() {
		return this.companyId;
	}
	
	this.setCompanyPlace = function(companyPlace){
		this.companyPlace = companyPlace;
	}
	
	this.getCompanyPlace = function() {
		return this.companyPlace;
	}
	
}//fin UserLogin
