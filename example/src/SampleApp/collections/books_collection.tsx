import { buildCollection } from "firecms";
import {
    OpenAIInstructionsActions
} from "../collection_actions/OpenAIInstructionsActions";

export const booksCollection = buildCollection({
    name: "Books",
    singularName: "Book",
    path: "books",
    icon: "MenuBook",
    group: "Main",
    textSearchEnabled: true,
    Actions: OpenAIInstructionsActions,
    description: "Example of a books collection that allows data enhancement through the use of the **OpenAI plugin**",
    // hideFromNavigation: true,
    properties: {
        title: {
            name: "Title",
            validation: { required: true },
            dataType: "string"
        },
        authors: {
            name: "Authors",
            dataType: "string"
        },
        description: {
            name: "Description",
            dataType: "string",
            multiline: true
        },
        spanish_description: {
            name: "Spanish description",
            dataType: "string",
            multiline: true
        },
        thumbnail: {
            name: "Thumbnail",
            dataType: "string",
            url: "image"
        },
        categories: {
            name: "Categories",
            dataType: "string"
        },
        published_year: {
            name: "Published Year",
            dataType: "number"
        },
        num_pages: {
            name: "Num pages",
            dataType: "number"
        },
        created_at: {
            name: "Created at",
            dataType: "date",
            autoValue: "on_create"
        }
        // isbn10: {
        //     name: "isbn10",
        //     dataType: "number"
        // }
    }
});
