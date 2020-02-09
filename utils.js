'use strict';

class utils
{
    /**
     * This function is called by the transactions defined inside the smart contract to validate the initiator of the transaction
     * @param {*} ctx The transaction context
     * @param {*} initiator This variable is used to store the organisation name of the initiating peer
     */

	validateInitiator(ctx, initiator)
	{
		const initiatorID = ctx.clientIdentity.getX509Certificate();
		console.log(initiator); 
		if(initiatorID.issuer.organizationName.trim() !== initiator)
		{
				throw new Error('Not authorized to initiate the transaction: ' + initiatorID.issuer.organizationName + ' not authorised to initiate this transaction');
		}
    }

    /**
     * This function is defined to validate the Bank Transaction ID at the time of rechaging the user's account
     * @param {*} bankTransactionID Bank Transaction ID which will we matched against a predefined set of transaction IDs
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

    //Stores any JSONvalue on the ledger
    async putData(ctx, key, JSONvalue)
    {
        // Convert the JSON object to a buffer and send it to blockchain for storage
        let dataBuffer = Buffer.from(JSON.stringify(JSONvalue));
        await ctx.stub.putState(key, dataBuffer);
    }

    //returns the JSON object for the key
    async getData(ctx, key)
    {
        let dataBuffer= await ctx.stub.getState(key).catch(err => console.log(err));
        let dataObject= JSON.parse(dataBuffer.toString())
        return dataObject;
    }
}

module.exports=utils;