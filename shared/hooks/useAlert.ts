
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import {setAlert} from "../redux/components";


export const useAlert = () => {


    const dispatch = useAppDispatch();
    const alert = useAppSelector((state) => state.components.alert);

    const openAlert = (params:any) => {
        dispatch(setAlert({visible:true,...params}));
    };
    const closeAlert = () => {
        dispatch(setAlert({visible:false}));
    };


    return { openAlert,closeAlert,alert };
};
