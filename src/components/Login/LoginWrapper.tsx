import React, { useContext, useEffect } from "react";
import axios from "axios";
import jwt from "jsonwebtoken";
import { Spinner } from "@chakra-ui/core";
import LoginForm from "./LoginForm";
import {
  UserContext,
  SAVE_USER,
  SAVE_TOKEN,
  LOADING,
} from "../../services/UserContext";
import { ContainerCentered } from "../Layout";

const localapi = process.env.REACT_APP_ROOT_API;
const usersUri = `${localapi}users/id/`;

// Wrapper del formulario Login, se encarga de guardar la informacion del usuario en la sesion, y renderizar condicionalmente la app.
const LoginWrapper: React.FC = ({ children }) => {
  const {
    store: {
      token,
      user: { email },
      isLoading,
    },
    dispatch,
  } = useContext(UserContext);

  // Revisar almacenamiento local buscando token
  // Si lo encuentra, lo guarda en UserContext
  // Si no lo encuentra, desactiva spinner
  useEffect(() => {
    const localToken = localStorage.getItem("token");
    console.log(localToken);
    if (localToken) {
      dispatch({ type: SAVE_TOKEN, payload: localToken });
    } else {
      dispatch({ type: LOADING, payload: false });
    }
  }, [dispatch]);

  // Si hay cambios en el estado del token, se descodifica y se pide al server info del usuario.
  // Guarda el token en el almacenamiento local, y los datos del usuario en UserContext
  // Desactiva spinner si ya terminó el request o no pudo decodificar el token
  // decodedIdentity.sub es el ID del usuario
  useEffect(() => {
    dispatch({ type: LOADING, payload: true });
    const decodedIdentity = jwt.decode(token);
    if (decodedIdentity) {
      localStorage.setItem("token", token);
      const userDataUri = usersUri + decodedIdentity.sub;
      axios
        .get(userDataUri, { headers: { Authorization: `Bearer ${token}` } })
        .then((res: any) => {
          console.log(res);
          dispatch({ type: SAVE_USER, payload: res.data });
        })
        .catch((err) => console.log(err))
        .finally(() => dispatch({ type: LOADING, payload: false }));
    } else {
      dispatch({ type: LOADING, payload: false });
    }
  }, [token, dispatch]);

  // Condicional : Esta cargando?
  // S: renderizar spinner,
  // N: usuario logueado?
  // S: renderizar app,
  // N: renderizar formulario de logueo

  if (isLoading)
    return (
      <ContainerCentered>
        <Spinner size="xl" />
      </ContainerCentered>
    );
  if (email) return <>{children}</>;
  return (
    <ContainerCentered>
      <LoginForm />
    </ContainerCentered>
  );
};

export default LoginWrapper;
