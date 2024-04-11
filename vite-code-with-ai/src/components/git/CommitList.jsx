const CommitList = ({ commits, checkout, compare }) => {
  return (
    <div className="flex flex-col space-y-1 text-sm">
      {commits.map((commit, index) => (
        <div
          key={commit.oid}
          className={`flex flex-row justify-between items-center space-x-2 border-b border-black cursor-pointer hover:bg-gray-700 `}
          onClick={() => {
            compare(commit, index);
          }}
        >
          <div className="flex flex-col">
            <span className="text-bold my-1">{commit.commit.message.split("\n")[0]}</span>
            <span className="flex flex-row">
              <img
                className="rounded-lg"
                src={`https://eu.ui-avatars.com/api/?name=${commit.commit.author.name}&size=24`}
              />
              <span className="ml-2">{commit.commit.author.name}</span>
            </span>
          </div>

          <div className="flex flex-col">
            <button
              onClick={() => {
                checkout(commit.oid);
              }}
            >
              GO
            </button>
           
          </div>
        </div>
      ))}
    </div>
  );
};

export default CommitList;
