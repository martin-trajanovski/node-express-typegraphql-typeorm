import axios from 'axios';

export const apiCall = async (query: string, token?: string | null) => {
  const config = {
    headers: {},
  };

  if (token) {
    config.headers = {
      Authorization: token,
    };
  }

  // console.log(query);

  // TODO: Maybe later the API url should be formed from env settings but for now it is ok.
  const response = await axios.post(
    'http://localhost:3002/api',
    { query },
    config
  );

  // console.log(response.data);

  return response.data;
};
