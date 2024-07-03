import { loadPath } from "@utils/loadPath";
import { ASSET_TYPE, ASSIGNMENT_STATUS, USER_TYPE } from "../types/enum.type";
import { LABEL_STATE, LABEL_TYPE } from './label';

export const ACCESS_TOKEN = "accessToken";
export const USER = "user";
//list path

export const USER_PATH_DEFAULT = loadPath('user', USER_TYPE, LABEL_TYPE);
export const ASSET_PATH_DEFAULT = loadPath('asset', ASSET_TYPE, LABEL_STATE);
export const ASSIGNMENT_PATH_DEFAULT = loadPath('assignment', ASSIGNMENT_STATUS, LABEL_STATE);


