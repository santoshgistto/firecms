import { EntitySchema, Property, ReferenceProperty } from "../../models";
import { FieldArray } from "formik";
import {
    Box,
    Button,
    createStyles,
    FormControl,
    FormHelperText,
    IconButton,
    makeStyles,
    Paper
} from "@material-ui/core";
import ClearIcon from "@material-ui/icons/Clear";
import DragHandleIcon from "@material-ui/icons/DragHandle";
import { formStyles } from "../../styles";
import {
    CMSFieldProps,
    FormContext,
    FormFieldBuilder
} from "../../models/form_props";
import React, { useState } from "react";
import { FieldDescription } from "../../components";
import { LabelWithIcon } from "../../components/LabelWithIcon";

import { DropTargetMonitor, useDrag, useDrop } from "react-dnd";
import { XYCoord } from "dnd-core";
import { PreviewComponent, ReferencePreview } from "../../preview";
import { ArrayEntry } from "./arrays/ArrayEntry";


const useStyles = makeStyles(theme => createStyles({
    arrayEntry: {
        marginBottom: theme.spacing(1),
        opacity: 1
    },
    arrayEntryDragging: {
        marginBottom: theme.spacing(1),
        border: "1px dashed gray",
        cursor: "move",
        opacity: 0.5
    },
    handle: {
        cursor: "move"
    }
}));

type ArrayDefaultFieldProps<T> = CMSFieldProps<T[]>;

export default function ArrayDefaultFieldOld<T>({
                                                    name,
                                                    value,
                                                    error,
                                                    showError,
                                                    isSubmitting,
                                                    autoFocus,
                                                    touched,
                                                    tableMode,
                                                    property,
                                                    createFormField,
                                                    includeDescription,
                                                    underlyingValueHasChanged,
                                                    context
                                                }: ArrayDefaultFieldProps<T>) {

    const ofProperty: Property = property.of as Property;
    const classes = formStyles();


    return <FormControl fullWidth error={showError}>

        {!tableMode && <FormHelperText filled
                                       required={property.validation?.required}>
            <LabelWithIcon scaledIcon={true} property={property}/>
        </FormHelperText>}

        <Paper variant={"outlined"}
               className={classes.paper}>
            <NewArrayContainer
                name={name}
                value={value}
                disabled={isSubmitting}
                buildEntry={(index, internalId) => <ReferencePreview
                    property={ofProperty as ReferenceProperty}
                    size={"regular"}
                    entitySchema={context.entitySchema}
                    PreviewComponent={PreviewComponent}
                    value={value[index] as any}/>}
            />

        </Paper>

        {includeDescription &&
        <FieldDescription property={property}/>}

        {showError
        && typeof error === "string"
        && <FormHelperText>{error}</FormHelperText>}

    </FormControl>;
}

function NewArrayContainer<T>({
                                  name,
                                  value,
                                  disabled,
                                  buildEntry
                              }: {
    name: string, value: T[], disabled: boolean,

    buildEntry: (index: number, internalId: number) => React.ReactNode;
}) {

    const [internalIds, setInternalIds] = useState<number[]>(
        value
            ? (value as T[]).map((v, index) => getRandomId())
            : []);

    const hasValue = value && value.length > 0;
    const [lastAddedId, setLastAddedId] = useState<number | undefined>();

    function getRandomId() {
        return Math.floor(Math.random() * Math.floor(Number.MAX_SAFE_INTEGER));
    }


    return <FieldArray
        name={name}
        render={arrayHelpers => {

            const moveItem = (dragIndex: number, hoverIndex: number) => {
                const newIds = [...internalIds];
                const temp = newIds[dragIndex];
                newIds[dragIndex] = newIds[hoverIndex];
                newIds[hoverIndex] = temp;
                setInternalIds(newIds);
                arrayHelpers.move(dragIndex, hoverIndex);
            };

            const insertInEnd = () => {
                const id = getRandomId();
                const newIds: number[] = [...internalIds, id];
                setLastAddedId(id);
                setInternalIds(newIds);
                arrayHelpers.push(null);
            };

            const remove = (index: number) => {
                const newValue = [...internalIds];
                newValue.splice(index, 1);
                setInternalIds(newValue);
                arrayHelpers.remove(index);
            };

            return (
                <>
                    {hasValue && internalIds.map((internalId: number, index: number) => (
                        <ArrayEntry
                            key={`array_field_${name}_${internalId}`}
                            name={name}
                            id={internalId}
                            type={"array_card_" + name}
                            moveItem={moveItem}
                            index={index}
                            remove={remove}
                        >
                            {buildEntry(index, internalId)}

                        </ArrayEntry>
                    ))

                    }

                    <Box p={1}
                         justifyContent="center"
                         textAlign={"left"}>
                        <Button variant="outlined"
                                color="primary"
                                disabled={disabled}
                                onClick={insertInEnd}>
                            Add
                        </Button>
                    </Box>
                </>);
        }}

    />;
}

function ArrayEntryOld<T>(props: {
    id: any
    name: string,
    value: any,
    moveItem: (dragIndex: number, hoverIndex: number) => void,
    type: string
    index: number,
    ofProperty: Property,
    autoFocus: boolean,
    includeDescription: boolean,
    createFormField: FormFieldBuilder,
    underlyingValueHasChanged: boolean;
    context: FormContext<any>,
    remove: (index: number) => void,
    entitySchema: EntitySchema
}) {
    const {
        id,
        name,
        moveItem,
        type,
        index,
        createFormField,
        autoFocus,
        includeDescription,
        underlyingValueHasChanged,
        context,
        ofProperty,
        remove,
        value,
        entitySchema
    } = props;

    const classes = useStyles();
    const ref = React.useRef<HTMLDivElement>(null);

    const [, drop] = useDrop({
        accept: type,
        hover(item: {
                  id: number
                  index: number,
                  type: string
              },
              monitor: DropTargetMonitor) {
            if (!ref.current) {
                return;
            }
            const dragIndex = item.index;
            const hoverIndex = index;

            // Don't replace items with themselves
            if (dragIndex === hoverIndex) {
                return;
            }

            if (!ref.current) {
                return;
            }

            // Determine rectangle on screen
            const hoverBoundingRect = ref.current.getBoundingClientRect();

            // Get vertical middle
            const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;

            // Determine mouse position
            const clientOffset = monitor.getClientOffset();

            // Get pixels to the top
            const hoverClientY = (clientOffset as XYCoord).y - hoverBoundingRect.top;

            // Dragging downwards
            if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY - 50) {
                return;
            }

            // Dragging upwards
            if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY + 50) {
                return;
            }

            // Time to actually perform the action
            moveItem(dragIndex, hoverIndex);

            // Note: we're mutating the monitor item here!
            // Generally it's better to avoid mutations,
            // but it's good here for the sake of performance
            // to avoid expensive index searches.
            item.index = hoverIndex;
        }
    });

    const [{ isDragging }, drag, preview] = useDrag({
        item: { type: type, id, index },
        collect: (monitor: any) => ({
            isDragging: monitor.isDragging()
        })
    });

    drag(drop(ref));

    return (
        <div ref={ref}
             className={isDragging ? classes.arrayEntryDragging : classes.arrayEntry}
        >
            <Box key={`field_${index}`}
                 display="flex">
                <Box flexGrow={1}
                     width={"100%"}
                     key={`field_${name}_entryValue`}>
                    {/*name?: string,*/}
                    {/*value: T,*/}
                    {/*property: Property<T>,*/}
                    {/*onClick?: MouseEventHandler<any>,*/}
                    {/*    size: PreviewSize,*/}
                    {/*    entitySchema: EntitySchema;*/}
                    <ReferencePreview property={ofProperty as ReferenceProperty}
                                      size={"regular"}
                                      entitySchema={entitySchema}
                                      PreviewComponent={PreviewComponent}
                                      value={value}/>
                    {/*{createFormField(*/}
                    {/*    {*/}
                    {/*        name: `${name}[${index}]`,*/}
                    {/*        property: ofProperty,*/}
                    {/*        includeDescription,*/}
                    {/*        underlyingValueHasChanged,*/}
                    {/*        context,*/}
                    {/*        tableMode: false,*/}
                    {/*        partOfArray: true,*/}
                    {/*        autoFocus,*/}
                    {/*    })}*/}
                </Box>
                <Box width={"48px"}
                     display="flex"
                     flexDirection="column"
                     alignItems="center">
                    <div className={classes.handle}>
                        <DragHandleIcon fontSize={"small"}/>
                    </div>
                    <IconButton
                        size="small"
                        aria-label="remove"
                        onClick={() => remove(index)}>
                        <ClearIcon fontSize={"small"}/>
                    </IconButton>
                </Box>
            </Box>
        </div>
    );
}

