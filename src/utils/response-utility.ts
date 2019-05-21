export class ResponseUtility {

    generateResponse(status: boolean, body: any) {
        return {
            isSuccess: status,
            ResponseBody: body
        };
    }

}
