import moment from 'moment';


const CommitList = ({ commits, checkout, compare }) => {
  return (
    <div className="flex w-full flex-col space-y-1 text-sm">
      {commits.map((commit, index) => (
        <div
          key={commit.oid}
          className={`flex w-full flex-row justify-between items-center space-x-2 border-b border-black p-1`}
          
        >
          <div className="flex flex-col cursor-pointer hover:bg-gray-700 w-10/12 p-1" onClick={() => {
            compare(commit, index);
          }}>
            <span className="text-bold my-1">
              {commit.commit.message.split("\n")[0].substring(0,60)}
            </span>
            <span className="flex flex-row">
              <img
                className="rounded-lg"
                src={`https://eu.ui-avatars.com/api/?name=${commit.commit.author.name}&size=24`}
              />
              <span className="ml-2">{commit.commit.author.name}</span>
              <span className="ml-2">
                {moment(commit.commit.author.timestamp * 1000).fromNow()}
              </span>{" "}
            </span>
          </div>

          <div className="flex flex-col w-2/12">
            <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-1 rounded text-xs"
              onClick={() => {
                checkout(commit.oid);
              }}
            >
              CheckOut
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default CommitList;
