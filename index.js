const {
    SSMClient,
    GetParametersByPathCommand,
  } = require('@aws-sdk/client-ssm');

  const getAllParametersByPath = async (path, options) => {
    if (!path) {
      throw Error('Please specify a path ');
    }
  
    const ssmClient = new SSMClient(options);
  
    const params = {
      Path           : path,
      Recursive      : true,
      WithDecryption : true,
    };
  
    const allParameters = {};
    let nextToken;
  
    do {
      if (nextToken) {
        params.NextToken = nextToken;
      }
      const command = new GetParametersByPathCommand(params);
      const response = await ssmClient.send(command);
  
      response.Parameters.forEach(param => {
        const name = param.Name.split('/').pop();
        allParameters[name] = param.Value;
      });
  
      nextToken = response.NextToken;
    } while (nextToken);
  
    return allParameters;
  };
  
  const setEnvVariables = async (path ='', options = { region: 'ap-south-1' }) => {
    const parameters = await getAllParametersByPath(path, options);
  
    if (parameters && typeof parameters === 'object') {
      for (const [key, value] of Object.entries(parameters)) {
        if (!process.env[key] && process.env[key] !== '') {
          process.env[key] = value;
        }
      }
    }
  };
  
  module.exports = setEnvVariables;
  