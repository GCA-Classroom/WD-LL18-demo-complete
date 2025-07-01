// Get references to elements
const imgContainer = document.getElementById('img-container');
const generateBtn = document.getElementById('generateBtn');
const movie1Input = document.getElementById('movie1');
const movie2Input = document.getElementById('movie2');

// This function generates a movie poster mashup using the two movie titles
async function generateImage() {
  // Get the movie titles from the input fields
  const movie1 = movie1Input.value;
  const movie2 = movie2Input.value;

  // Create a prompt for the image generation
  const prompt = `A fun movie poster mashup of "${movie1}" and "${movie2}"`;

  const apiUrl  = 'https://api.openai.com/v1/images/generations';
  const requestBody = {
    model: 'gpt-image-1',
    quality: 'medium',
    prompt,
    n: 1,
    size: '1024x1536'
  };

  // Show a loading message
  imgContainer.textContent = 'Creating your poster...';

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify(requestBody)
    });

    const jsonResponse = await response.json();
    const data = jsonResponse.data;
    const base64Image = data[0].b64_json;

    // Display the image in the #img-container
    imgContainer.innerHTML = `<img src="data:image/png;base64,${base64Image}" alt="${prompt}">`;
  } catch (error) {
    // Show an error message if image generation fails
    imgContainer.textContent = 'Sorry, an image could not be created. Please try again.';
    console.error('Image generation failed:', error);
  }
}

// Run generateImage when the button is clicked
generateBtn.addEventListener('click', generateImage);