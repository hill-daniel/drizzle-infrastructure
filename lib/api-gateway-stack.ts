import * as cdk from "@aws-cdk/core";
import {LambdaRestApi} from "@aws-cdk/aws-apigateway/lib/lambda-api";
import * as gateway from "@aws-cdk/aws-apigateway";
import * as lambda from "@aws-cdk/aws-lambda";

export interface ApiGatewayProps extends cdk.StackProps {
    handler: lambda.IFunction
}

export class ApiGatewayStack extends cdk.Stack {

    public readonly apiGateway: LambdaRestApi;

    constructor(scope: cdk.Construct, id: string, props: ApiGatewayProps) {
        super(scope, id, props);

        this.apiGateway = new gateway.LambdaRestApi(this, 'drizzle-api', {
            restApiName: 'drizzle webhook handler',
            description: 'accepts incoming webhook POST requests and validates them',
            handler: props.handler
        });

        new cdk.CfnOutput(this, 'apiUrl', {value: this.apiGateway.url});
    }
}

