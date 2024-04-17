
# ACCENDIA

Advanced Chatbot for Customized Engagement and Navigation in Database Interaction

## Introduction
------------
The ACCENDIA is a Python application that allows you to chat with multiple PDF documents. You can ask questions about the PDFs using natural language, and the application will provide relevant responses based on the content of the documents. This app utilizes a language model to generate accurate answers to your queries. Please note that the app will only respond to questions related to the loaded PDFs.

## Dependencies and Installation
----------------------------
To install the ACCENDIA, please follow these steps:
1. Clone the repository to your local machine.

2. Install the required dependencies by running the following command:
   ```
   pip install -r requirements.txt
   ```
3. Install and Setup RabbitMQ from https://www.rabbitmq.com/


4. Install and Setup PostgreSQL from https://www.postgresql.org/


5. Obtain an API key from OpenAI and add it to the `.env` file in the project directory.
```commandline
OPENAI_API_KEY=your_secret_api_key
```

## Usage
-----
To use the ACCENDIA, follow these steps:

1. Ensure that you have installed the required dependencies and added the OpenAI API key to the `.env` file.

2. Run ```app.py```
- Flask Setup:
   - Flask application initialized with CORS enabled to handle cross-origin requests.
   - Configuration for Celery and caching set up.
   - Flask app configured to run on host '0.0.0.0' and port 8000.

3. API Endpoints:
   - /api/upload/<model>/<project_id>: Handles file uploads and extraction of content from PDF files. Asynchronously processes uploads and extraction tasks.
   - /api/<model>/<projectID>/query: Handles user queries by searching for relevant documents and generating responses. Asynchronously handles query tasks.
   - /api/tasks/<task_id>: Retrieves the status of asynchronous tasks by task ID.

4. Start Celery
- Celery Tasks:
   - upload_pdf: Processes uploaded PDF files, extracts content, and saves to FAISS database.
   - extract_content: Extracts content from PDF files and saves to FAISS database.
   - handle_query: Handles user queries by searching for relevant documents and generating responses using OpenAI or Gemini model.
   - get_status: Retrieves the status of asynchronous tasks.

5. Helper Functions:
   - parse_pdf: Parses PDF files and extracts text content.
   - text_to_docs: Converts text content into document chunks.
   - embed_docs: Embeds document chunks using OpenAIEmbeddings.
   - search_docs: Searches for relevant documents based on user queries.
   - get_answer: Generates answers to user queries based on relevant documents.
   - get_answer_sub: Generates answers to user queries using the Gemini model with chat history.

6. Prompts:
   - A template for generating prompts for user queries is defined in the prompt.py file.
   - The template includes placeholders for question, summaries, and final answer, filled dynamically based on user queries

7. Frontend
The frontend component of ACCENDIA is designed solely for demonstration purposes to illustrate how the system's REST API can be utilized by end-users. It comprises a simple web interface that allows users to interact with the system by submitting natural language queries and receiving responses. The frontend is implemented using HTML, CSS, and JavaScript, with minimal styling and functionality to focus on the demonstration aspect.
1. Functionality:
   - `download_pdf`: Downloads a PDF file from a given URL.
   - `question_answer`: Handles user input by processing PDF uploads or URL downloads and extracting content for question answering.
   - `get_query`: Generates answers to user questions based on provided chat history, question, and selected model.

2. UI Components:
   - Chatbot Interface: Displays chat history and allows users to enter questions.
   - Input Fields:
     - OpenAI API Key: Allows users to input their OpenAI API key for authorization.
     - Project ID: Allows users to specify a project ID or name for backend processing.
     - PDF URL: Enables users to provide a URL to download PDF files.
     - File Upload: Allows users to upload PDF files directly.
     - Question Input: Provides a text box for users to enter custom questions or select from predefined questions.
     - Model Selection: Radio buttons to choose between GPT and Gemini models.

3. Predefined Questions:
   - A list of predefined questions is provided for user convenience. Users can click on a question to autofill the input box.

4. Interaction:
   - Users can submit their questions or file uploads by clicking on the corresponding buttons.
   - Responses are displayed in the chat history section, providing an interactive conversational experience.





## Methodology

![Methodology diagram](https://github.com/Raghav-Kamath/ACCENDIA/blob/dev2/docs/PDF-LangChain.jpg?raw=true)

The methodology proposed within ACCENDIA revolves around a multi-step process tailored to handle diverse document types and facilitate user queries seamlessly. At its core, the methodology integrates several key components, ensuring effective document processing and responsive query handling.
 
Initially, ACCENDIA employs a sophisticated document detection mechanism, assuming the accurate identification of file formats. This step is pivotal as it triggers distinct processing paths, leveraging specialized methods for PDF documents. Subsequently, the system applies tailored content extraction methodologies, utilizing modules like UnstructuredFileLoader from the Lang chain library. These modules play a pivotal role in extracting text content from different document formats, laying the foundation for subsequent processing.
 
Content segmentation emerges as a crucial phase in ACCENDIA's methodology, assuming the strategic division of document content into manageable chunks. Leveraging the CharacterTextSplitter strategy, the system fragments text into coherent sections based on predefined criteria, allowing for more efficient handling and semantic relevance. The methodology inherently assumes the importance of context preservation between these chunks, achieved through carefully calibrated overlap parameters.

Additionally, ACCENDIA's methodology incorporates embedding generation, where each chunk undergoes transformation into meaningful embeddings using OpenAI's language models. This step assumes the accurate capture of semantic nuances and contextual relevance within these embeddings, critical for subsequent query responses.

Further, the system's functionality relies on a robust document search mechanism facilitated by FAISS vector stores. This dependency assumes the accurate representation and indexing of document embeddings, enabling swift and accurate retrieval of relevant chunks in response to user queries.
 
In essence, the methodology woven into ACCENDIA's framework assumes a sequential and nuanced approach, encompassing document detection, content extraction, segmentation, embedding generation, and efficient retrieval. The success of each step is pivotal, as they collectively drive the system's ability to handle diverse document types, provide accurate representations, and deliver pertinent responses to user queries. Adjustments or refinements in these stages can significantly impact ACCENDIA's efficacy and performance.

## Output:
Gradio Interface:
1. Upload File
![Snippet of the demonstrative UI (Upload file)](https://github.com/Raghav-Kamath/ACCENDIA/assets/71326720/4f636892-1c83-4b12-a388-32d2fb8d9ef8)

2. Query, Chat History and other options
![Snippet of the demonstrative UI (Query & Chat History)](https://github.com/Raghav-Kamath/ACCENDIA/assets/71326720/a494f334-2368-4fdf-ac20-c4d47c74bdb1)



