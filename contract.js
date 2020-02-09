'use strict';

const {Contract} = require('fabric-contract-api');

class RegnetContract extends Contract {


	
	constructor() {
		// Provide a custom name to refer to this smart contract
		super('org.property-registration-network.regnet');
		global.usersOrg = 'users.property-registration-network.com';
		global.registrarOrg = 'registrar.property-registration-network.com'
	}

	validateInitiator(ctx, initiator)
	{
		const initiatorID = ctx.clientIdentity.getX509Certificate();
		console.log(initiator); 
		if(initiatorID.issuer.organizationName.trim() !== initiator)
		{
				throw new Error('Not authorized to initiate the transaction: ' + initiatorID.issuer.organizationName + ' not authorised to initiate this transaction');
		}
	}
	

	/* ****** All custom functions are defined below ***** */
	
	// This is a basic user defined function used at the time of instantiating the smart contract
	// to print the success message on console
	async instantiate(ctx) {
		console.log('Regnet Smart Contract Instantiated');
	}
	
	/**
	 * Create a request to registrar for registering on the network
	 * @param ctx - The transaction Context object
	 * @param name - Name of the user who is initiating the request
	 * @param email - Email Id of the user
	 * @param phone - Phone number of the user
	 * @param aadharNo - Aadhar Number of the user
	 * @param accoutNumber- Bank account Number of the user
	 */
	async requestNewUser(ctx, name, email, phone, aadharNo)
	{
		// Create a new composite key for the new request
		const requestKey = ctx.stub.createCompositeKey('org.property-registration-network.com.regnet.users.requests', [name,aadharNo]);
		// Create a request object for creation of new 
		//this.validateInitiator(ctx,'users.property-registration-network.com');
		console.log(requestKey);
		let newRequestObject={
			requestID: requestKey,
			name: name,
			email: email,
			aadharNo: aadharNo,
			phone: phone,
			createdAt: new Date()
		};
		// Convert the JSON object to a buffer and send it to blockchain for storage
		let dataBuffer = Buffer.from(JSON.stringify(newRequestObject));
		await ctx.stub.putState(requestKey, dataBuffer);
		// Return value of new student account created to user
		return newRequestObject;
	}
	/**
	 * Create a request to registrar for registering on the network
	 * @param ctx - The transaction Context object
	 * @param name - Name of the user who is initiating the request
	 * @param aadharNo - Aadhar Number of the user
	 */
	async approveNewUser(ctx, name, aadharNo)
	{

		this.validateInitiator(ctx, registrarOrg);
		const requestKey = ctx.stub.createCompositeKey('org.property-registration-network.com.regnet.users.requests', [name,aadharNo]);
		const newUserKey = ctx.stub.createCompositeKey('org.property-registration-network.com.regnet.users', [name,aadharNo]);
		let requestBuffer= await ctx.stub.getState(requestKey).catch(err => console.log(err));
		let requestObject= JSON.parse(requestBuffer.toString());
		let newUserObject={
			requestID: requestKey,
			name: requestObject.name,
			email: requestObject.email,
			aadharNo: requestObject.aadharNo,
			phone: requestObject.phone,
			upgradCoins: 0,
			createdAt: new Date()
		};
		console.log(newUserObject);
		let dataBuffer = Buffer.from(JSON.stringify(newUserObject));
		await ctx.stub.putState(newUserKey, dataBuffer);
		return newUserObject;
	}
	/**
	 * 
	 * @param {*} transactionID - MOney Transaction ID generated at the time of transferring money to validate
	 * @param {*} numUpgradCoins 
	 */

	verifyTransactionfromBank(bankTransactionID)
	{
		//Perform operations to validate the transaction from the bank.
		if (bankTransactionID == 'upg100')
			return 100;
		else if (bankTransactionID == 'upg500')
			return 500;
		else if (bankTransactionID == 'upg1000')
			return 1000;
		else
			return -1;
	}

/**
 * rechargeAccount() is used to recharge the user's account with 
 * @param ctx - context object
 * @param bankTransactionID -  Proof that the transaction is done of the requisite amount
 * @param name - Name of the user 
 * verifyTransactionfromBank() function is called within this function to validate the bankTransactionID passed as input parameter
 */

	async rechargeAccount(ctx, name, aadharNo, bankTransactionID)
	{
		//this.validateInitiator(ctx, this.usersOrg);
		const userKey = ctx.stub.createCompositeKey('org.property-registration-network.com.regnet.users', [name,aadharNo]);
		let userBuffer= await ctx.stub.getState(userKey).catch(err => console.log(err));
		let userObject= JSON.parse(userBuffer.toString());
		let numUpgradCoins= this.verifyTransactionfromBank(bankTransactionID);

		if (numUpgradCoins != -1)
		{
			userObject.upgradCoins= userObject.upgradCoins+numUpgradCoins;
			let userBuffer = Buffer.from(JSON.stringify(userObject));
			await ctx.stub.putState(userKey, userBuffer);
		}
		else{
			throw new Error('Not allowed to update balance: Invalid Bank Transaction ID' );
		}
	}

	async viewUser(ctx, name, aadharNo)
	{
		const userKey = ctx.stub.createCompositeKey('org.property-registration-network.com.regnet.users', [name,aadharNo]);
		let userBuffer= await ctx.stub.getState(userKey).catch(err => console.log(err));
		let userObject= JSON.parse(userBuffer.toString());
		console.log(userObject);
	}

	async propertyRegistrationRequest(ctx, name, aadharNo, propertyID, price)
	{
		//this.validateInitiator(ctx, this.usersOrg);
		const requestKey= ctx.stub.createCompositeKey('org.property-registration-network.com.regnet.property.requests', [propertyID]);
		const userKey = ctx.stub.createCompositeKey('org.property-registration-network.com.regnet.users', [name,aadharNo]);
		let userBuffer= await ctx.stub.getState(userKey).catch(err => console.log(err));
		if (userBuffer.length === 0)
			throw new Error('Not allowed to register Property: User not registered on the system' );
		else
		{
			let newRequestObject={
				requestID: requestKey,
				owner: userKey,
				price: parseInt(price),
				status: 'registered'
			};

			let dataBuffer = Buffer.from(JSON.stringify(newRequestObject));
			await ctx.stub.putState(requestKey, dataBuffer);
			return newRequestObject;
		}
	}

	async approvePropertyRegistration(ctx, propertyID)
	{
		this.validateInitiator(ctx, registrarOrg);
		const requestKey= ctx.stub.createCompositeKey('org.property-registration-network.com.regnet.property.requests', [propertyID]);
		const propertyKey = ctx.stub.createCompositeKey('org.property-registration-network.com.regnet.property', [propertyID]);

		let requestBuffer= await ctx.stub.getState(requestKey).catch(err => console.log(err));
		let requestObject= JSON.parse(requestBuffer.toString());
		if (requestBuffer.length !== 0)
		{
			let newPropertyObject={
				propertyID: propertyKey,
				owner: requestObject.owner,
				price: requestObject.price,
				status: 'registered'
			};
			let dataBuffer = Buffer.from(JSON.stringify(newPropertyObject));
			await ctx.stub.putState(propertyKey, dataBuffer);
		}
		else
			throw new Error('Request for PropertyID: '+ propertyID + ' not registered');
	}

	async viewProperty(ctx, propertyID)
	{
		const propertyKey = ctx.stub.createCompositeKey('org.property-registration-network.com.regnet.property', [propertyID]);
		let propertyBuffer= await ctx.stub.getState(propertyKey).catch(err => console.log(err));
		let propertyObject= JSON.parse(propertyBuffer.toString());
		return propertyObject;
	}

	async updateProperty(ctx, propertyID, name, aadharNo, status)
	{
		//this.validateInitiator(ctx, this.usersOrg);
		const owner= ctx.stub.createCompositeKey('org.property-registration-network.com.regnet.users', [name,aadharNo]);
		const propertyKey = ctx.stub.createCompositeKey('org.property-registration-network.com.regnet.property', [propertyID]);
		let propertyBuffer= await ctx.stub.getState(propertyKey).catch(err => console.log(err));
		let propertyObject= JSON.parse(propertyBuffer.toString());
		if (propertyObject.owner == owner)
		{
			propertyObject.status= status;
			let dataBuffer = Buffer.from(JSON.stringify(propertyObject));
			await ctx.stub.putState(propertyKey, dataBuffer);
		}
		else
			throw new Error('User: '+ name + ' with Aadhar Number: '+ aadharNo + 'not authorised to make this transaction');
	}

	async purchaseProperty(ctx, propertyID, name, aadharNo)
	{
		//this.validateInitiator(ctx, this.usersOrg);
		const buyerKey= ctx.stub.createCompositeKey('org.property-registration-network.com.regnet.users', [name,aadharNo]);
		let buyerBuffer = await ctx.stub.getState(buyerKey).catch(err => console.log(err));
		let buyerObject = JSON.parse(buyerBuffer.toString());
		const propertyKey = ctx.stub.createCompositeKey('org.property-registration-network.com.regnet.property', [propertyID]);
		let propertyBuffer= await ctx.stub.getState(propertyKey).catch(err => console.log(err));
		let propertyObject= JSON.parse(propertyBuffer.toString());
		let sellerKey= propertyObject.owner;
		let sellerBuffer = await ctx.stub.getState(sellerKey).catch(err => console.log(err));
		let sellerObject= JSON.parse(sellerBuffer.toString());

		if (buyerBuffer.length === 0)
			throw new Error('User: '+ name + ' with Aadhar Number: '+ aadharNo + 'not registered on the property registration network');
		if (propertyObject.status === 'registered')
			throw new Error('Property with PropertyID: '+ propertyID + 'not registered for sale. Please contact the owner of the property. :)');
		console.log("buyerObject.numUpgradCoins:  ",buyerObject.numUpgradCoins);
		console.log("propertyObject.price: ",propertyObject.price);
		
		if (buyerObject.upgradCoins >= propertyObject.price)
		{
			propertyObject.owner=buyerKey;
			propertyObject.status = 'registered';
			sellerObject.upgradCoins += propertyObject.price;
			buyerObject.upgradCoins -= propertyObject.price;
			let propertyBuffer = Buffer.from(JSON.stringify(propertyObject));
			await ctx.stub.putState(propertyKey, propertyBuffer);
			let sellerBuffer = Buffer.from(JSON.stringify(sellerObject));
			await ctx.stub.putState(sellerKey, sellerBuffer);
			let buyerBuffer = Buffer.from(JSON.stringify(buyerObject));
			await ctx.stub.putState(buyerKey, buyerBuffer);

		}
		else
			throw new Error('Buyer has insufficient funds');
	}	
}

module.exports = RegnetContract;
