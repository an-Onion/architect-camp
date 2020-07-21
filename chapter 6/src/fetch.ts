import axios, {AxiosResponse, AxiosRequestConfig} from "axios";

interface Config extends AxiosRequestConfig {
  meta: {
    requestStartedAt: number;
  }
}

interface Response extends AxiosResponse {
  responseTime: number;
  config: Config;
}

axios.interceptors.request.use( (config: Config) => {
  config.meta = { requestStartedAt: new Date().getTime() }
  return config;
})

axios.interceptors.response.use((response: Response) => {
  response.responseTime = new Date().getTime() - response.config.meta.requestStartedAt;
  return response;
});

export function fetch(url: string): Promise<number> {
  return axios(url).then((response: Response) => response.responseTime);
}

