'use strict';

const{Contract}=require('fabric-contract-api');

class RegistrarContract extends contract{
constructor(){

super('org.property-registration-network.regnet');

}

async instantiate(ctx){
	console.log('Registraction-Registrat Contract has been instantiated');
	}
	
//function to aprove a user request 
async approveNewUser(ctx,userName,userAadhar){
	let caller=ctx.clientIdentity.getMSPID()
	//checking whether the invoker of the function is registrar or not
	if(caller=='registrarMSP')
	{


	//fetching the user requests
	const requestKey=ctx.stub.createCompositeKey('org.property-registration-network.usernet.request',[userName,userAadhar]);

	let RequestBuffer= await ctx.stub.getState(OwnerKey).catch(err=>console.log(err));
	
	const request= JSON.parse(RequestBuffer.toString());
	//checking whteher the request exist or not
	if(request.length==0) {
		throw new Error('Invalid Uer Request')
	}
	else{
	//if the request exist
	const userKey=ctx.stub.createCompositeKey('org.property-registration-network.regnet.user',[userName,userAadhar]);
	let initupg=0;
	
	let newUserObject={
		
		
		
		userName: request.userName,
		userEmail: request.userEmail,
		userPhn: request.userPhn,
		userAadhar: request.userAadhar,
		createdAt: request.createdAt,
		updatedAt:  new Date(),
		registerby: ctx.clientIdentity.getMSPID(),
		upgradCoins :initupg ,
		
	};	
	// writing the approved user object on the ledger
		let dataBuffer =Buffer.from(JSON.stringify(newuserObject));
		await ctx.stub.putState(userKey,dataBuffer);
		return newUserObject;
	}
}
else {
	console.log("some non-registrar called this function");
	throw new Error('Invalid User , only regestrar users can invoke this funtion');
} 

}

//function to a property request 
async approvePropertyRegistration(ctx){


	let caller=ctx.clientIdentity.getMSPID()
	//checking whether the invoker of the function is registrar or not
	if(caller=='registrarMSP')
	{
		//fetching the property request 
		const propertyRequestKey=ctx.stub.createCompositeKey('org.property-registration-network.usernet.propertyRequest',[propertyId]);
		
		const propertyrequest= JSON.parse(RequestBuffer.toString());
	if(request.length==0) {
		//checking whetehr the request exists or not
		throw new Error('Invalid User Request')
	}
	else{
		// if the request exists
		const propertyKey=ctx.stub.createCompositeKey('org.property-registration-network.regnet.property',[propertyId]);
		
		let newPropertyObject={
			
			
			
			propertyId: propertyrequest.propertyId,
			propertyOwner: propertyrequest.OwnerKey,
			propertyPrice: propertyrequest.propertyPrice,
			propertyStatus: propertyrequest.propertyStatus,
			
		};	
		//writing the approved property object in the ledger
			let dataBuffer =Buffer.from(JSON.stringify(newPropertyObject));
			await ctx.stub.putState(propertyKey,dataBuffer);
			return newPropertyObject;
		}
	}
	else{
		console.log("some non-registrar called this function");
		throw new Error('Invalid User Request, only regestrar users can invoke this funtion');
	}
}
//function to view a registered user
async viewUser(ctx,userName,userAadhar){
	const userKey=ctx.stub.createCompositeKey('org.property-registration-network.regnet.user',[userName,userAadhar]);
	let userBuffer = await ctx.stub.getState(userKey).catch(err=>console.log(err));
	return JSON.parse(userBuffer.toString());
}
//function to view a registrer user
async viewProperty(ctx,propertyId){
	const propertyKey=ctx.stub.createCompositeKey('org.property-registration-network.regnet.property',[propertyId]);
	let propertyBuffer = await ctx.stub.getState(propertyKey).catch(err=>console.log(err));
	return JSON.parse(propertyBuffer.toString());
}

}

