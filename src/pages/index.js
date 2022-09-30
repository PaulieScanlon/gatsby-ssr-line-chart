import React from 'react';

import LineChart from '../components/line-chart';

const Page = ({ serverData: { results } }) => {
  return (
    <section className="grid gap-4">
      <div>
        <h1 className="m-0 text-cetner text-gray-900">Gatsby Repository Activity</h1>
        <p className="m-0 text-gray-600">
          Displays a weekly aggregate of the number of <span className="font-bold text-green-400">additions</span> and{' '}
          <span className="font-bold text-red-400">deletions</span> pushed to the GitHub repository.
        </p>
      </div>
      <div className="border border-gray-200 rounded-lg p-2 sm:p-4">
        <LineChart data={results} />
      </div>
    </section>
  );
};

export const getServerData = async () => {
  const { Octokit } = require('octokit');

  const octokit = new Octokit({ auth: process.env.OCTOKIT_PERSONAL_ACCESS_TOKEN });
  const currentYear = new Date().getFullYear();

  try {
    //  https://docs.github.com/en/rest/metrics/statistics#get-the-weekly-commit-activity
    const response = await octokit.request('GET /repos/{owner}/{repo}/stats/code_frequency', {
      owner: 'gatsbyjs',
      repo: 'gatsby'
    });

    if (response.status === 200) {
      const results = response.data
        .map(([unixTime, additions, deletions]) => {
          const date = new Date(unixTime * 1000);
          return {
            date: String(date),
            year: date.getFullYear(),
            additions,
            deletions
          };
        })
        .filter((result) => result.year === currentYear);

      return {
        props: {
          results: results
        }
      };
    } else {
      throw new Error('Octokit Error');
    }
  } catch (error) {
    return {
      props: {
        error: error
      }
    };
  }
};

export default Page;
