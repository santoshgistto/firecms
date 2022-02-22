import React, { createElement } from "react";
import {
    ArrayProperty,
    CMSType,
    EntityReference,
    ResolvedArrayProperty,
    ResolvedMapProperty,
    ResolvedNumberProperty,
    ResolvedReferenceProperty,
    ResolvedStringProperty,
    ResolvedTimestampProperty,
    StringProperty
} from "../models";

import {
    ArrayOfMapsPreview,
    ArrayOfReferencesPreview,
    ArrayOfStorageComponentsPreview,
    ArrayOfStringsPreview,
    ArrayOneOfPreview,
    ArrayPropertyPreview,
    ArrayPropertyEnumPreview,
    BooleanPreview,
    EmptyValue,
    MapPropertyPreview,
    NumberPropertyPreview,
    ReferencePropertyPreview,
    StorageThumbnail,
    StringPropertyPreview,
    TimestampPropertyPreview,
    UrlComponentPreview
} from "./internal";
import { ErrorView } from "../core/components";

import { PreviewComponentProps } from "./PreviewComponentProps";

import { Markdown } from "./components/Markdown";

/**
 * @category Preview components
 */
export function PreviewComponent<T extends CMSType>(props: PreviewComponentProps<T>) {
    let content: JSX.Element | any;
    const {
        property, propertyKey, value, size, height, width
    } = props;

    const fieldProps = { ...props };

    if (value === undefined) {
        content = <EmptyValue/>;
    } else if (property.Preview) {
        content = createElement(property.Preview as React.ComponentType<PreviewComponentProps>,
            {
                propertyKey: propertyKey,
                value,
                property,
                size,
                height,
                width,
                customProps: property.customProps
            });
    } else if (value === null) {
        content = <EmptyValue/>;
    } else if (property.dataType === "string") {
        const stringProperty = property as StringProperty;
        if (typeof value === "string") {
            if (stringProperty.url) {
                content =
                    <UrlComponentPreview size={fieldProps.size} url={value}/>;
            } else if (stringProperty.storage) {
                content = <StorageThumbnail
                    storeUrl={property.storage?.storeUrl ?? false}
                    size={fieldProps.size}
                    storagePathOrDownloadUrl={value}/>;
            } else if (stringProperty.markdown) {
                content = <Markdown source={value}/>;
            } else {
                content = <StringPropertyPreview {...fieldProps}
                                                 property={property as ResolvedStringProperty}
                                                 value={value}/>;
            }
        } else {
            content = buildWrongValueType(propertyKey, property.dataType, value);
        }
    } else if (property.dataType === "array") {
        if (value instanceof Array) {
            const arrayProperty = property as ArrayProperty;
            if (!arrayProperty.of && !arrayProperty.oneOf) {
                throw Error(`You need to specify an 'of' or 'oneOf' prop (or specify a custom field) in your array property ${propertyKey}`);
            }

            if (arrayProperty.of) {
                if (arrayProperty.of.dataType === "map") {
                    content =
                        <ArrayOfMapsPreview propertyKey={propertyKey}
                                            property={property as ResolvedArrayProperty}
                                            value={value as object[]}
                                            size={size}
                        />;
                } else if (arrayProperty.of.dataType === "reference") {
                    if (typeof arrayProperty.of.path === "string") {
                        content = <ArrayOfReferencesPreview {...fieldProps}
                                                            value={value}
                                                            property={property as ResolvedArrayProperty}/>;
                    } else {
                        content = <EmptyValue/>;
                    }
                } else if (arrayProperty.of.dataType === "string") {
                    if (arrayProperty.of.enumValues) {
                        content = <ArrayPropertyEnumPreview
                            {...fieldProps}
                            value={value as string[]}
                            property={property as ResolvedArrayProperty}/>;
                    } else if (arrayProperty.of.storage) {
                        content = <ArrayOfStorageComponentsPreview
                            {...fieldProps}
                            value={value}
                            property={property as ResolvedArrayProperty}/>;
                    } else {
                        content = <ArrayOfStringsPreview
                            {...fieldProps}
                            value={value as string[]}
                            property={property as ResolvedArrayProperty}/>;
                    }
                } else if (arrayProperty.of.dataType === "number") {
                    if (arrayProperty.of.enumValues) {
                        content = <ArrayPropertyEnumPreview
                            {...fieldProps}
                            value={value as string[]}
                            property={property as ResolvedArrayProperty}/>;
                    }
                } else {
                    content = <ArrayPropertyPreview {...fieldProps}
                                                    value={value}
                                                    property={property as ResolvedArrayProperty}/>;
                }
            } else if (arrayProperty.oneOf) {
                content = <ArrayOneOfPreview {...fieldProps}
                                             value={value}
                                             property={property as ResolvedArrayProperty}/>;
            }
        } else {
            content = buildWrongValueType(propertyKey, property.dataType, value);
        }
    } else if (property.dataType === "map") {
        if (typeof value === "object") {
            content =
                <MapPropertyPreview {...fieldProps}
                                    property={property as ResolvedMapProperty}/>;
        } else {
            content = buildWrongValueType(propertyKey, property.dataType, value);
        }
    } else if (property.dataType === "timestamp") {
        if (value instanceof Date) {
            content = <TimestampPropertyPreview {...fieldProps}
                                                value={value}
                                                property={property as ResolvedTimestampProperty}/>;
        } else {
            content = buildWrongValueType(propertyKey, property.dataType, value);
        }
    } else if (property.dataType === "reference") {
        if (typeof property.path === "string") {
            if (value instanceof EntityReference) {
                content = <ReferencePropertyPreview
                    {...fieldProps}
                    value={value as EntityReference}
                    property={property as ResolvedReferenceProperty}
                />;
            } else {
                content = buildWrongValueType(propertyKey, property.dataType, value);
            }
        } else {
            content = <EmptyValue/>;
        }

    } else if (property.dataType === "boolean") {
        if (typeof value === "boolean") {
            content = <BooleanPreview value={value}/>;
        } else {
            content = buildWrongValueType(propertyKey, property.dataType, value);
        }
    } else if (property.dataType === "number") {
        if (typeof value === "number") {
            content = <NumberPropertyPreview {...fieldProps}
                                             value={value}
                                             property={property as ResolvedNumberProperty}/>;
        } else {
            content = buildWrongValueType(propertyKey, property.dataType, value);
        }
    } else {
        content = JSON.stringify(value);
    }

    return content === undefined || content === null ? <EmptyValue/> : content;
}

function buildWrongValueType(name: string | undefined, dataType: string, value: any) {
    console.error(`Unexpected value for property ${name}, of type ${dataType}`, value);
    return (
        <ErrorView error={`Unexpected value: ${JSON.stringify(value)}`}/>
    );
}

