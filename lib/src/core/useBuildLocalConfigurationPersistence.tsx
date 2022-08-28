import {
    CMSType,
    LocalEntityCollection,
    UserConfigurationPersistence
} from "../models";
import { stripCollectionPath } from "./util";

export function useBuildLocalConfigurationPersistence(): UserConfigurationPersistence {

    function onCollectionModified<M extends { [Key: string]: CMSType }>(path: string, data: LocalEntityCollection<M>) {
        const storageKey = `collection_config::${stripCollectionPath(path)}`;
        localStorage.setItem(storageKey, JSON.stringify(data));
    }

    function getCollectionConfig<M extends { [Key: string]: CMSType }>(path: string): LocalEntityCollection<M> {
        const storageKey = `collection_config::${stripCollectionPath(path)}`;
        const item = localStorage.getItem(storageKey);
        return item ? JSON.parse(item) : {};
    }

    return {
        onCollectionModified,
        getCollectionConfig
    }
}
