

function Userpage() {

    return (
        <div>
            <button onClick={() => auth.signOut()}>Sign Out</button>
        </div>
    );
}

export default Userpage;