[![Review Assignment Due Date](https://classroom.github.com/assets/deadline-readme-button-22041afd0340ce965d47ae6ef1cefeee28c7c493a6346c4f15d667ab976d596c.svg)](https://classroom.github.com/a/bzPrOe11)

# CS3219 Project (PeerPrep) - AY2425S1

## Group: G01

### Production:
Deployed link: https://g01-peer-prep.vercel.app/

Admin account (if needed): 
- email: `test@gmail.com`
- password: `123123`

### Local (How to test): 

#### Setting up: 
1. Clone [our repo](https://github.com/CS3219-AY2425S1/cs3219-ay2425s1-project-g01.git) on your preferred IDE
2. Open 2 terminals on your IDE (One for Frontend, One for Backend)
3. Ensure you're on our latest commit on main branch

#### Spin up backend
Before proceeding to the following procedures, install Docker Desktop

Run the docker containers by entering the following command in the root directory:
```
docker compose -f docker-compose.yml up -d
```
> [!WARNING]
> Only one instance of containers should be running at any point in time.
> That is, let your other friends know that they need to close theirs if you're testing!

To close your containers, run the following command in the root directory:
```
docker compose -f docker-compose.yml down
```

#### Then, spin up the frontend 
1. Install [Node](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm)
2. On your frontend terminal in the root folder (cs3219-ay2425s1-project-g01), navigate to the `peer-prep-fe` subfolder:
```
cd peer-prep-fe
```
3. Run the command `npm install` to install the required packages
```
npm install
```
4. Then, run the command `npm install -g @angular/cli`
```
npm install -g @angular/cli
```
5. Once done, run the command `ng serve` to start the local development server
```
ng serve
```
6. Once the following content appears in the terminal, the local development server has been successfully started
<img width="500" alt="image" src="https://github.com/user-attachments/assets/d92add4f-63fa-4456-a62a-c2fdbd2d864c">

