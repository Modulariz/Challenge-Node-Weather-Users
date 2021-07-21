# build env
FROM node:13.12.0-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . ./
ARG REACT_APP_WEATHER_API
ENV REACT_APP_WEATHER_API $REACT_APP_WEATHER_API
ARG REACT_APP_WEATHER_API_KEY
ENV REACT_APP_WEATHER_API_KEY $REACT_APP_WEATHER_API_KEY
ARG REACT_APP_WEATHER_API_LANG
ENV REACT_APP_WEATHER_API_LANG $REACT_APP_WEATHER_API_LANG
ARG REACT_APP_MAP_API_KEY
ENV REACT_APP_MAP_API_KEY $REACT_APP_MAP_API_KEY
ARG PUBLIC_URL
ENV PUBLIC_URL $PUBLIC_URL
RUN npm run build

# production env
FROM nginx:stable-alpine
COPY --from=build /app/build /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]